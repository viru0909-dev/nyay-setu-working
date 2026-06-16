package com.nyaysetu.backend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.JwtService;
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
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * End-to-end integration tests for the authentication flows
 * (Register, Login, Token Refresh) exercised through the real Spring
 * Security filter chain via {@link MockMvc}.
 *
 * <p>The full application context boots with the {@code test} profile
 * (H2 in-memory DB, Flyway disabled, mock mail) so requests travel the
 * exact path a real client would: validation, the JWT filter, the
 * authentication manager, the controllers and the global exception
 * handler. Every method runs inside a transaction that is rolled back
 * afterwards, and each test provisions its own unique user so the
 * methods are independent and order-insensitive.
 *
 * <p>All REST controllers are served under the {@code /api/v1} prefix
 * added by {@code WebMvcConfig}, so the auth routes are
 * {@code /api/v1/auth/...}. Checked exceptions from MockMvc and Jackson
 * are funnelled through the {@code call}/{@code body}/{@code asJson}
 * helpers so the test methods keep narrow, specific signatures.
 *
 * Resolves #865.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    /**
     * A policy-compliant password (>= 8 chars with an uppercase letter, a
     * digit and a special character) generated fresh for each test instance.
     * Built at runtime so no credential literal is committed to the repo.
     */
    private final String password = strongPassword();

    private static String strongPassword() {
        return "Aa1@" + UUID.randomUUID().toString().substring(0, 8);
    }

    private String uniqueEmail() {
        return "auth-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
    }

    // --- helpers that absorb the framework's checked exceptions --- //

    private MvcResult call(RequestBuilder request) {
        try {
            return mockMvc.perform(request).andReturn();
        } catch (Exception e) {
            throw new IllegalStateException("MockMvc request failed", e);
        }
    }

    private String bodyOf(Map<String, ?> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize test payload", e);
        }
    }

    private JsonNode asJson(MvcResult result) {
        try {
            return objectMapper.readTree(result.getResponse().getContentAsString());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to parse response body", e);
        }
    }

    private int statusOf(MvcResult result) {
        return result.getResponse().getStatus();
    }

    private MvcResult postJson(String path, Map<String, ?> payload) {
        return call(authPost(path)
                .contentType(MediaType.APPLICATION_JSON)
                .content(bodyOf(payload)));
    }

    /**
     * Builds a POST whose client IP is unique per request. The
     * application's IP-based {@code RateLimitFilter} (5 requests per client)
     * would otherwise throttle the many auth calls this suite makes from the
     * single MockMvc loopback address. A distinct {@code X-Forwarded-For}
     * per request gives each its own rate-limit bucket without disabling the
     * real filter chain under test.
     */
    private MockHttpServletRequestBuilder authPost(String path) {
        return post(path).header("X-Forwarded-For", nextClientIp());
    }

    private static final AtomicInteger IP_SEQUENCE = new AtomicInteger();

    private static String nextClientIp() {
        int n = IP_SEQUENCE.incrementAndGet();
        return "10.10." + ((n >> 8) & 0xFF) + "." + (n & 0xFF);
    }

    /** Registers a LITIGANT through the public endpoint and asserts success. */
    private void register(String email) {
        MvcResult result = postJson("/api/v1/auth/register",
                Map.of("email", email, "name", "Test User", "password", password));
        assertEquals(200, statusOf(result));
    }

    /** Logs in and returns the parsed JSON response body. */
    private JsonNode login(String email, String pwd) {
        return asJson(postJson("/api/v1/auth/login",
                Map.of("email", email, "password", pwd)));
    }

    // ===================== REGISTER FLOW ===================== //

    @Test
    void register_withValidPayload_returnsTokenAndLitigantUser() {
        String email = uniqueEmail();

        MvcResult result = postJson("/api/v1/auth/register",
                Map.of("email", email, "name", "Asha Mehta", "password", password));

        assertEquals(200, statusOf(result));
        JsonNode json = asJson(result);
        assertFalse(json.path("token").asText().isEmpty());
        assertEquals(email, json.path("user").path("email").asText());
        assertEquals("Asha Mehta", json.path("user").path("name").asText());
        assertEquals("LITIGANT", json.path("user").path("role").asText());
    }

    @Test
    void register_persistsUserWithHashedPasswordAndLitigantRole() {
        String email = uniqueEmail();

        register(email);

        User saved = userRepository.findByEmail(email).orElseThrow();
        assertEquals(Role.LITIGANT, saved.getRole());
        // Password must be stored hashed, never in plain text.
        assertNotEquals(password, saved.getPassword());
        assertTrue(passwordEncoder.matches(password, saved.getPassword()));
    }

    @Test
    void register_returnsUsableJwtForTheNewUser() {
        String email = uniqueEmail();

        MvcResult result = postJson("/api/v1/auth/register",
                Map.of("email", email, "name", "Token User", "password", password));

        assertEquals(200, statusOf(result));
        String token = asJson(result).path("token").asText();
        assertEquals(email, jwtService.extractUsername(token));
    }

    @Test
    void register_withWeakPassword_isRejected() {
        // 8 chars (passes @Size) but no uppercase/digit/special -> policy fails.
        MvcResult result = postJson("/api/v1/auth/register",
                Map.of("email", uniqueEmail(), "name", "Weak Pass", "password", "abcdefgh"));

        assertEquals(400, statusOf(result));
        assertTrue(asJson(result).path("message").asText().contains("Password"));
    }

    @Test
    void register_withInvalidEmail_isRejected() {
        MvcResult result = postJson("/api/v1/auth/register",
                Map.of("email", "not-an-email", "name", "Bad Email", "password", password));

        assertEquals(400, statusOf(result));
    }

    @Test
    void register_withBlankName_isRejected() {
        MvcResult result = postJson("/api/v1/auth/register",
                Map.of("email", uniqueEmail(), "name", "", "password", password));

        assertEquals(400, statusOf(result));
    }

    @Test
    void register_withDuplicateEmail_isRejected() {
        String email = uniqueEmail();
        register(email);

        MvcResult result = postJson("/api/v1/auth/register",
                Map.of("email", email, "name", "Duplicate User", "password", password));

        int status = statusOf(result);
        assertTrue(status >= 400 && status < 500, "expected 4xx but was " + status);
    }

    // ===================== LOGIN FLOW ===================== //

    @Test
    void login_withValidCredentials_returnsAccessAndRefreshTokens() {
        String email = uniqueEmail();
        register(email);

        MvcResult result = postJson("/api/v1/auth/login",
                Map.of("email", email, "password", password));

        assertEquals(200, statusOf(result));
        JsonNode json = asJson(result);
        assertFalse(json.path("token").asText().isEmpty());
        assertFalse(json.path("accessToken").asText().isEmpty());
        assertFalse(json.path("refreshToken").asText().isEmpty());
        assertEquals(email, json.path("user").path("email").asText());
        assertEquals("LITIGANT", json.path("user").path("role").asText());
    }

    @Test
    void login_accessTokenEncodesTheAuthenticatedUser() {
        String email = uniqueEmail();
        register(email);

        String accessToken = login(email, password).path("accessToken").asText();

        assertEquals(email, jwtService.extractUsername(accessToken));
    }

    @Test
    void login_withWrongPassword_returnsUnauthorized() {
        String email = uniqueEmail();
        register(email);

        MvcResult result = postJson("/api/v1/auth/login",
                Map.of("email", email, "password", password + "X"));

        assertEquals(401, statusOf(result));
        assertEquals("Invalid credentials", asJson(result).path("message").asText());
    }

    @Test
    void login_withUnknownUser_returnsUnauthorized() {
        MvcResult result = postJson("/api/v1/auth/login",
                Map.of("email", uniqueEmail(), "password", password));

        assertEquals(401, statusOf(result));
    }

    @Test
    void login_withBlankPassword_isRejectedByValidation() {
        MvcResult result = postJson("/api/v1/auth/login",
                Map.of("email", uniqueEmail(), "password", ""));

        assertEquals(400, statusOf(result));
    }

    // ===================== TOKEN REFRESH FLOW ===================== //

    @Test
    void refresh_withValidRefreshToken_returnsNewAccessToken() {
        String email = uniqueEmail();
        register(email);
        String refreshToken = login(email, password).path("refreshToken").asText();

        MvcResult result = postJson("/api/v1/auth/refresh",
                Map.of("refreshToken", refreshToken));

        assertEquals(200, statusOf(result));
        String newAccessToken = asJson(result).path("accessToken").asText();
        assertFalse(newAccessToken.isEmpty());
        assertEquals(email, jwtService.extractUsername(newAccessToken));
    }

    @Test
    void refresh_withInvalidRefreshToken_returnsUnauthorized() {
        MvcResult result = postJson("/api/v1/auth/refresh",
                Map.of("refreshToken", "not.a.valid.jwt"));

        assertEquals(401, statusOf(result));
    }

    @Test
    void refresh_withMissingRefreshToken_isRejectedByValidation() {
        MvcResult result = call(authPost("/api/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"));

        assertEquals(400, statusOf(result));
    }

    @Test
    void refresh_issuesADistinctTokenFromTheRefreshToken() {
        String email = uniqueEmail();
        register(email);
        String refreshToken = login(email, password).path("refreshToken").asText();

        MvcResult result = postJson("/api/v1/auth/refresh",
                Map.of("refreshToken", refreshToken));

        assertEquals(200, statusOf(result));
        String newAccessToken = asJson(result).path("accessToken").asText();
        // A fresh access token is minted; it is not the refresh token echoed back.
        assertNotEquals(refreshToken, newAccessToken);
    }
}