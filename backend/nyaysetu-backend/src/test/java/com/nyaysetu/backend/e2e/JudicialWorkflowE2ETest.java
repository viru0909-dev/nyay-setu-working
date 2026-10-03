package com.nyaysetu.backend.e2e;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nyaysetu.backend.entity.AuthProvider;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

/**
 * End-to-end coverage of the core judicial workflow: a litigant registers and
 * files a case, a lawyer takes it on, a judge hears it and delivers judgment,
 * and the litigant is notified and can read the outcome.
 *
 * <p>This is the path the platform exists to serve, and until now it had no
 * automated coverage at all. Every step travels the real HTTP surface through
 * {@link MockMvc}: bean validation, the JWT filter, {@code @PreAuthorize} and
 * {@code CaseAccessService} all run exactly as they would for a browser client,
 * so a regression in authorisation is caught as readily as one in business logic.
 *
 * <p>The full context boots under the {@code test} profile (in-memory H2, Flyway
 * off, every outbound integration pointed at a closed port). Each test method
 * runs in a transaction that is rolled back, and provisions its own uniquely
 * named actors, so the methods are independent and order-insensitive.
 *
 * <p>Two notes on the contract being asserted, both verified against the code
 * rather than assumed:
 * <ul>
 *   <li>{@code WebMvcConfig} prefixes every {@code @RestController} with
 *       {@code /api/v1}, so these are the real paths a client uses.</li>
 *   <li>Delivering a verdict moves a case to {@code COMPLETED}, not
 *       {@code CLOSED}. Both values exist in {@link com.nyaysetu.backend.entity.CaseStatus};
 *       {@code CaseManagementService#deliverVerdict} sets the former, and the
 *       assertions below pin the behaviour that actually ships.</li>
 * </ul>
 *
 * Resolves #1630.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class JudicialWorkflowE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Satisfies the registration password policy
     * ({@code >= 8 chars, one uppercase, one digit, one special}). Generated at
     * runtime so no credential literal is committed.
     */
    private final String password = "Aa1@" + UUID.randomUUID().toString().substring(0, 8);

    /** An authenticated actor: the persisted user plus a real bearer token. */
    private record Actor(Long id, String email, String token) {
    }

    // ─── framework plumbing ──────────────────────────────────────────────────

    private static final AtomicInteger IP_SEQUENCE = new AtomicInteger();

    /**
     * A distinct client IP per request. {@code RateLimitFilter} buckets by
     * client address and this suite makes far more than the per-bucket
     * allowance, so without this the later steps would 429. Spreading the
     * requests across buckets keeps the real filter in the chain under test
     * rather than disabling it.
     */
    private static String nextClientIp() {
        int n = IP_SEQUENCE.incrementAndGet();
        return "10.20." + ((n >> 8) & 0xFF) + "." + (n & 0xFF);
    }

    private MvcResult call(RequestBuilder request) {
        try {
            return mockMvc.perform(request).andReturn();
        } catch (Exception e) {
            throw new IllegalStateException("MockMvc request failed", e);
        }
    }

    private String json(Map<String, ?> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize test payload", e);
        }
    }

    private JsonNode bodyOf(MvcResult result) {
        try {
            String content = result.getResponse().getContentAsString();
            return content.isBlank() ? objectMapper.createObjectNode() : objectMapper.readTree(content);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to parse response body", e);
        }
    }

    private int status(MvcResult result) {
        return result.getResponse().getStatus();
    }

    /** Asserts the status and returns the parsed body, reporting the body on failure. */
    private JsonNode expectOk(MvcResult result, String step) {
        assertEquals(200, status(result),
                () -> step + " failed with " + status(result) + ": " + safeBody(result));
        return bodyOf(result);
    }

    private String safeBody(MvcResult result) {
        try {
            return result.getResponse().getContentAsString();
        } catch (IOException e) {
            return "<unreadable body>";
        }
    }

    private MockHttpServletRequestBuilder authed(MockHttpServletRequestBuilder builder, Actor actor) {
        return builder
                .header("X-Forwarded-For", nextClientIp())
                .header("Authorization", "Bearer " + actor.token());
    }

    private MvcResult postAs(Actor actor, String path, Map<String, ?> payload) {
        return call(authed(post(path), actor)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(payload)));
    }

    private MvcResult putAs(Actor actor, String path, Map<String, ?> payload) {
        return call(authed(put(path), actor)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(payload)));
    }

    private MvcResult getAs(Actor actor, String path) {
        return call(authed(get(path), actor));
    }

    // ─── actor provisioning ──────────────────────────────────────────────────

    private String uniqueEmail(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8) + "@example.test";
    }

    private String login(String email) {
        MvcResult result = call(post("/api/v1/auth/login")
                .header("X-Forwarded-For", nextClientIp())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("email", email, "password", password))));

        JsonNode body = expectOk(result, "login for " + email);
        String token = body.path("token").asText(null);
        assertNotNull(token, () -> "login returned no token: " + body);
        return token;
    }

    /**
     * Registers a litigant through the public endpoint, which is the only role
     * obtainable over HTTP — {@code AuthController} hard-codes
     * {@link Role#LITIGANT} so the API cannot be used to mint privileged users.
     */
    private Actor registerLitigant() {
        String email = uniqueEmail("litigant");

        MvcResult registration = call(post("/api/v1/auth/register")
                .header("X-Forwarded-For", nextClientIp())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("email", email, "name", "Test Litigant", "password", password))));
        expectOk(registration, "litigant registration");

        User saved = userRepository.findByEmail(email).orElseThrow();
        assertEquals(Role.LITIGANT, saved.getRole(), "registration must not grant a privileged role");

        return new Actor(saved.getId(), email, login(email));
    }

    /**
     * Seeds a LAWYER or JUDGE directly. There is deliberately no HTTP route to
     * create one, so the fixture writes the row and then authenticates through
     * the real login endpoint to obtain a genuine token.
     */
    private Actor seedStaff(Role role) {
        String email = uniqueEmail(role.name().toLowerCase());

        User saved = userRepository.save(User.builder()
                .email(email)
                .name("Test " + role.name().charAt(0) + role.name().substring(1).toLowerCase())
                .password(passwordEncoder.encode(password))
                .role(role)
                .authProvider(AuthProvider.LOCAL)
                .build());

        return new Actor(saved.getId(), email, login(email));
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  The journey
    // ═══════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("A case travels filing → lawyer → hearing → judgment and the litigant is notified")
    void completeJudicialWorkflow() {
        Actor litigant = registerLitigant();
        Actor lawyer = seedStaff(Role.LAWYER);
        Actor judge = seedStaff(Role.JUDGE);

        // ── 1. Litigant files a case ─────────────────────────────────────────
        JsonNode filed = expectOk(postAs(litigant, "/api/v1/cases", Map.of(
                "title", "Unlawful eviction from tenanted premises",
                "description", "Landlord changed the locks without notice or a court order.",
                "caseType", "PROPERTY",
                "petitioner", "Test Litigant",
                "respondent", "Landlord Respondent",
                "urgency", "URGENT"
        )), "case filing");

        String caseId = filed.path("id").asText(null);
        assertNotNull(caseId, () -> "filed case has no id: " + filed);

        // ── 2. …and sees it in their own case list ───────────────────────────
        JsonNode myCases = expectOk(getAs(litigant, "/api/v1/cases?page=0&size=20"), "litigant case list");
        assertTrue(containsCase(myCases, caseId),
                () -> "filed case " + caseId + " missing from the litigant's list: " + myCases);

        // ── 3. Lawyer is proposed, accepts, and can see the case ─────────────
        expectOk(postAs(litigant, "/api/v1/cases/" + caseId + "/propose-lawyer",
                Map.of("lawyerId", lawyer.id())), "proposing a lawyer");

        expectOk(postAs(lawyer, "/api/v1/cases/" + caseId + "/respond-proposal",
                Map.of("status", "ACCEPTED")), "lawyer accepting the proposal");

        JsonNode lawyerCases = expectOk(getAs(lawyer, "/api/v1/lawyer/cases?page=0&size=20"),
                "lawyer case list");
        assertTrue(lawyerCases.toString().contains(caseId),
                () -> "accepted case " + caseId + " missing from the lawyer's list: " + lawyerCases);

        // ── 4. Judge takes the case and schedules a hearing ──────────────────
        expectOk(postAs(judge, "/api/v1/cases/" + caseId + "/assign-judge", Map.of()),
                "assigning a judge");

        String hearingDate = LocalDateTime.now().plusDays(14)
                .withNano(0).withSecond(0)
                .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        JsonNode scheduled = expectOk(postAs(judge, "/api/v1/hearings/schedule", Map.of(
                "caseId", caseId,
                "scheduledDate", hearingDate,
                "durationMinutes", 45
        )), "scheduling a hearing");

        String hearingId = extractHearingId(scheduled);
        assertNotNull(hearingId, () -> "scheduling returned no hearing id: " + scheduled);

        // ── 5. Judge records what happened at the hearing ────────────────────
        expectOk(postAs(judge, "/api/v1/hearings/" + hearingId + "/outcome", Map.of(
                "outcomeType", "HEARD",
                "judgeNotes", "Both parties heard. Tenancy agreement admitted in evidence."
        )), "recording the hearing outcome");

        JsonNode hearing = expectOk(getAs(judge, "/api/v1/hearings/" + hearingId), "reading the hearing back");
        assertTrue(hearing.toString().contains("Tenancy agreement admitted"),
                () -> "judge's notes were not persisted on the hearing: " + hearing);

        // ── 6. Judge delivers judgment and the case reaches its terminal state ─
        JsonNode verdict = expectOk(postAs(judge, "/api/v1/cases/" + caseId + "/deliver-verdict",
                Map.of("verdictDetails", "Possession restored to the petitioner with costs.")),
                "delivering the verdict");
        assertEquals("COMPLETED", verdict.path("newStatus").asText(),
                () -> "unexpected terminal status: " + verdict);

        JsonNode closedCase = expectOk(getAs(litigant, "/api/v1/cases/" + caseId),
                "litigant reading the decided case");
        assertEquals("COMPLETED", closedCase.path("status").asText(),
                () -> "case did not reach its terminal status: " + closedCase);

        // ── 7. The litigant is notified along the way ────────────────────────
        JsonNode notifications = expectOk(
                getAs(litigant, "/api/v1/notifications/user/" + litigant.id()),
                "litigant notifications");
        assertTrue(notifications.isArray() && !notifications.isEmpty(),
                () -> "litigant received no notification across the whole workflow: " + notifications);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Authorisation boundaries on the same workflow
    // ═══════════════════════════════════════════════════════════════════════

    @Test
    @DisplayName("A litigant cannot schedule a hearing on their own case")
    void litigantCannotScheduleHearing() {
        Actor litigant = registerLitigant();
        String caseId = fileMinimalCase(litigant);

        MvcResult result = postAs(litigant, "/api/v1/hearings/schedule", Map.of(
                "caseId", caseId,
                "scheduledDate", LocalDateTime.now().plusDays(7).withNano(0)
                        .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                "durationMinutes", 30
        ));

        assertEquals(403, status(result),
                () -> "scheduling must be judge-only, got " + status(result) + ": " + safeBody(result));
    }

    @Test
    @DisplayName("A litigant cannot deliver a verdict on their own case")
    void litigantCannotDeliverVerdict() {
        Actor litigant = registerLitigant();
        String caseId = fileMinimalCase(litigant);

        MvcResult result = postAs(litigant, "/api/v1/cases/" + caseId + "/deliver-verdict",
                Map.of("verdictDetails", "I find in my own favour."));

        assertEquals(403, status(result),
                () -> "delivering a verdict must be judge-only, got " + status(result)
                        + ": " + safeBody(result));
    }

    /**
     * The security property that matters is that an anonymous caller cannot file
     * a case, and that holds. Worth knowing, though: the request is answered with
     * a 302 to the OAuth2 login page rather than a 401, because the chain has an
     * oauth2Login entry point and no {@code AuthenticationEntryPoint} restricting
     * it to browser routes. A JSON client cannot act on a redirect to an HTML
     * login form, so this is arguably wrong for {@code /api/**} — but it is what
     * ships today, and pinning it here means changing it has to be deliberate.
     */
    @Test
    @DisplayName("An unauthenticated caller cannot file a case")
    void anonymousCannotFileCase() {
        MvcResult result = call(post("/api/v1/cases")
                .header("X-Forwarded-For", nextClientIp())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                        "title", "Anonymous filing",
                        "description", "Should never be accepted.",
                        "caseType", "CIVIL",
                        "petitioner", "Nobody",
                        "respondent", "Someone"
                ))));

        int status = status(result);
        assertTrue(status < 200 || status >= 300,
                () -> "anonymous filing must not succeed, got " + status + ": " + safeBody(result));
        assertEquals(302, status,
                () -> "expected the documented redirect-to-login behaviour, got " + status);
        assertTrue(result.getResponse().getRedirectedUrl() != null
                        && result.getResponse().getRedirectedUrl().contains("oauth2"),
                () -> "expected a redirect to the OAuth2 login, got "
                        + result.getResponse().getRedirectedUrl());
    }

    @Test
    @DisplayName("Filing rejects a payload that fails bean validation")
    void filingRejectsInvalidPayload() {
        Actor litigant = registerLitigant();

        MvcResult result = postAs(litigant, "/api/v1/cases", Map.of(
                "title", "",
                "description", "",
                "caseType", "",
                "petitioner", "",
                "respondent", ""
        ));

        assertEquals(400, status(result),
                () -> "blank required fields must be rejected, got " + status(result)
                        + ": " + safeBody(result));
    }

    // ─── shared helpers ──────────────────────────────────────────────────────

    private String fileMinimalCase(Actor litigant) {
        JsonNode filed = expectOk(postAs(litigant, "/api/v1/cases", Map.of(
                "title", "Boundary dispute",
                "description", "Neighbour has encroached on the shared boundary wall.",
                "caseType", "PROPERTY",
                "petitioner", "Test Litigant",
                "respondent", "Neighbour Respondent",
                "urgency", "NORMAL"
        )), "case filing");

        String caseId = filed.path("id").asText(null);
        assertNotNull(caseId, () -> "filed case has no id: " + filed);
        return caseId;
    }

    /** The list endpoint returns a Spring {@code Page}, so the rows sit under "content". */
    private boolean containsCase(JsonNode listing, String caseId) {
        JsonNode rows = listing.has("content") ? listing.get("content") : listing;
        for (JsonNode row : rows) {
            if (caseId.equals(row.path("id").asText())) {
                return true;
            }
        }
        return false;
    }

    /** Scheduling returns a summary map; the id may be nested under "hearing". */
    private String extractHearingId(JsonNode scheduled) {
        for (String path : new String[]{"hearingId", "id"}) {
            if (scheduled.hasNonNull(path)) {
                return scheduled.get(path).asText();
            }
            JsonNode nested = scheduled.path("hearing");
            if (nested.hasNonNull(path)) {
                return nested.get(path).asText();
            }
        }
        return null;
    }
}
