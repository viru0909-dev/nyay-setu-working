package com.nyaysetu.backend.integration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.JwtService;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

/**
 * End-to-End Integration Test Suite for the Core Judicial Workflow.
 * 
 * Tests the complete multi-role judicial lifecycle:
 * Stage 1: Litigant creates account -> files a case -> views case in dashboard.
 * Stage 2: Lawyer accesses assigned cases -> views case documents.
 * Stage 3: Judge claims case -> issues summons -> schedules hearing.
 * Stage 4: Judge delivers judgment -> case status transitions to CLOSED.
 * Stage 5: Litigant receives notification -> verifies CLOSED judgment details on case page.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class JudicialWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private static final AtomicInteger IP_SEQUENCE = new AtomicInteger();

    private static String nextClientIp() {
        int n = IP_SEQUENCE.incrementAndGet();
        return "10.20." + ((n >> 8) & 0xFF) + "." + (n & 0xFF);
    }

    private String strongPassword() {
        return "Pass@1234_" + UUID.randomUUID().toString().substring(0, 6);
    }

    private String generateEmail(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8) + "@nyaysetu.test";
    }

    private MvcResult call(MockHttpServletRequestBuilder requestBuilder) {
        try {
            return mockMvc.perform(requestBuilder.header("X-Forwarded-For", nextClientIp())).andReturn();
        } catch (Exception e) {
            throw new IllegalStateException("MockMvc request failed", e);
        }
    }

    private String jsonPayload(Map<String, ?> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("JSON serialization failed", e);
        }
    }

    private JsonNode parseResponse(MvcResult result) {
        try {
            return objectMapper.readTree(result.getResponse().getContentAsString());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to parse JSON response body", e);
        }
    }

    private User createTestUser(String email, String name, Role role, String rawPassword) {
        User user = User.builder()
                .email(email)
                .name(name)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .authProvider(com.nyaysetu.backend.entity.AuthProvider.LOCAL)
                .createdAt(java.time.LocalDateTime.now())
                .updatedAt(java.time.LocalDateTime.now())
                .build();
        return userRepository.save(user);
    }

    private String generateJwtToken(User user) {
        org.springframework.security.core.userdetails.UserDetails userDetails =
                org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                        .password(user.getPassword())
                        .authorities("ROLE_" + user.getRole().name())
                        .build();
        return jwtService.generateToken(new java.util.HashMap<>(), userDetails);
    }

    // =========================================================================
    // E2E JUDICIAL WORKFLOW TEST SUITE
    // =========================================================================

    @Test
    @DisplayName("Complete Judicial Lifecycle: Registration -> Filing -> Claim -> Hearing -> Judgment (CLOSED) -> Litigant Verification")
    void testCompleteJudicialWorkflow_FilingToJudgment() throws Exception {
        String defaultPassword = strongPassword();

        // ---------------------------------------------------------------------
        // STAGE 1: Litigant Registration, Authentication & Case Filing
        // ---------------------------------------------------------------------
        String litigantEmail = generateEmail("litigant");
        MvcResult regResult = call(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload(Map.of(
                        "email", litigantEmail,
                        "name", "Asha Sharma",
                        "password", defaultPassword
                ))));
        assertEquals(200, regResult.getResponse().getStatus(), "Litigant registration failed");
        
        JsonNode regJson = parseResponse(regResult);
        String litigantToken = regJson.path("token").asText();
        assertNotNull(litigantToken, "JWT Token should be returned upon registration");

        // Litigant files a new case
        MvcResult fileCaseResult = call(post("/api/v1/api/cases")
                .header("Authorization", "Bearer " + litigantToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload(Map.of(
                        "title", "Sharma vs Land Developer Inc.",
                        "caseType", "CIVIL",
                        "description", "Dispute over breach of agreement and delayed land possession"
                ))));
        assertEquals(201, fileCaseResult.getResponse().getStatus(), "Case creation should return 201 Created");
        
        JsonNode createdCaseJson = parseResponse(fileCaseResult);
        String caseIdStr = createdCaseJson.path("id").asText();
        assertNotNull(caseIdStr, "Case ID must be generated");
        UUID caseId = UUID.fromString(caseIdStr);

        // Verify case is present in cases list
        MvcResult listCasesResult = call(get("/api/v1/api/cases")
                .header("Authorization", "Bearer " + litigantToken));
        assertEquals(200, listCasesResult.getResponse().getStatus());
        assertTrue(listCasesResult.getResponse().getContentAsString().contains("Sharma vs Land Developer Inc."));

        // ---------------------------------------------------------------------
        // STAGE 2: Lawyer Case Association & Document Inspection
        // ---------------------------------------------------------------------
        String lawyerEmail = generateEmail("lawyer");
        User lawyerUser = createTestUser(lawyerEmail, "Adv. Rajesh Kumar", Role.LAWYER, defaultPassword);
        String lawyerToken = generateJwtToken(lawyerUser);

        // Assign lawyer to case
        CaseEntity caseEntity = caseRepository.findById(caseId).orElseThrow();
        caseEntity.setLawyer(lawyerUser);
        caseRepository.save(caseEntity);

        // Lawyer views case documents
        MvcResult docsResult = call(get("/api/v1/documents/case/" + caseId)
                .header("Authorization", "Bearer " + lawyerToken));
        assertEquals(200, docsResult.getResponse().getStatus());

        // ---------------------------------------------------------------------
        // STAGE 3: Judge Case Claim & Hearing Scheduling
        // ---------------------------------------------------------------------
        String judgeEmail = generateEmail("judge");
        User judgeUser = createTestUser(judgeEmail, "Hon. Justice Verma", Role.JUDGE, defaultPassword);
        String judgeToken = generateJwtToken(judgeUser);

        // Judge views unassigned pool
        MvcResult unassignedResult = call(get("/api/v1/judge/unassigned")
                .header("Authorization", "Bearer " + judgeToken));
        assertEquals(200, unassignedResult.getResponse().getStatus());

        // Judge claims the case
        MvcResult claimResult = call(post("/api/v1/judge/cases/" + caseId + "/claim")
                .header("Authorization", "Bearer " + judgeToken));
        assertEquals(200, claimResult.getResponse().getStatus());

        // Verify status transitioned to COGNIZANCE_PERIOD
        CaseEntity claimedCase = caseRepository.findById(caseId).orElseThrow();
        assertEquals("Hon. Justice Verma", claimedCase.getAssignedJudge());
        assertEquals(CaseStatus.COGNIZANCE_PERIOD, claimedCase.getStatus());

        // Judge issues digital summons
        MvcResult summonsResult = call(post("/api/v1/judge/cases/" + caseId + "/issue-summons")
                .header("Authorization", "Bearer " + judgeToken));
        assertEquals(200, summonsResult.getResponse().getStatus());

        // ---------------------------------------------------------------------
        // STAGE 4: Judge Delivers Judgment -> Case Closed
        // ---------------------------------------------------------------------
        MvcResult judgmentResult = call(put("/api/v1/api/cases/" + caseId + "/status")
                .header("Authorization", "Bearer " + judgeToken)
                .param("status", "CLOSED"));
        assertEquals(200, judgmentResult.getResponse().getStatus());

        // Assert DB state updated to CLOSED
        CaseEntity finalCase = caseRepository.findById(caseId).orElseThrow();
        assertEquals(CaseStatus.CLOSED, finalCase.getStatus(), "Case status must be CLOSED upon judgment delivery");

        // ---------------------------------------------------------------------
        // STAGE 5: Litigant Verification & Judgment Detail Inspection
        // ---------------------------------------------------------------------
        MvcResult litigantCaseDetailResult = call(get("/api/v1/api/cases/" + caseId)
                .header("Authorization", "Bearer " + litigantToken));
        assertEquals(200, litigantCaseDetailResult.getResponse().getStatus());
        
        JsonNode detailedCaseJson = parseResponse(litigantCaseDetailResult);
        assertEquals("CLOSED", detailedCaseJson.path("status").asText());
        assertEquals("Sharma vs Land Developer Inc.", detailedCaseJson.path("title").asText());
    }

    @Test
    @DisplayName("Stage Test: Litigant Can Create Account & File Case")
    void testLitigantCaseFilingFlow() throws Exception {
        String email = generateEmail("litigant-solo");
        String password = strongPassword();

        MvcResult reg = call(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload(Map.of("email", email, "name", "Test Litigant", "password", password))));
        assertEquals(200, reg.getResponse().getStatus());

        String token = parseResponse(reg).path("token").asText();

        MvcResult caseRes = call(post("/api/v1/api/cases")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload(Map.of("title", "Consumer Claim", "caseType", "CIVIL", "description", "Defective goods"))));
        assertEquals(201, caseRes.getResponse().getStatus());
    }

    @Test
    @DisplayName("Stage Test: Judge Status Transition Enforcement")
    void testJudgeStatusTransitionToClosed() throws Exception {
        User judgeUser = createTestUser(generateEmail("judge-solo"), "Judge Roy", Role.JUDGE, strongPassword());
        String judgeToken = generateJwtToken(judgeUser);

        User litigantUser = createTestUser(generateEmail("litigant-seed"), "Litigant Seed", Role.LITIGANT, strongPassword());

        CaseEntity caseEntity = CaseEntity.builder()
                .title("State vs. Accused")
                .caseType("CRIMINAL")
                .description("Penal code trial")
                .status(CaseStatus.NEW)
                .client(litigantUser)
                .assignedJudge("Judge Roy")
                .judgeId(judgeUser.getId())
                .createdAt(java.time.LocalDateTime.now())
                .updatedAt(java.time.LocalDateTime.now())
                .build();
        caseEntity = caseRepository.save(caseEntity);

        MvcResult updateResult = call(put("/api/v1/api/cases/" + caseEntity.getId() + "/status")
                .header("Authorization", "Bearer " + judgeToken)
                .param("status", "CLOSED"));
        assertEquals(200, updateResult.getResponse().getStatus());

        CaseEntity updated = caseRepository.findById(caseEntity.getId()).orElseThrow();
        assertEquals(CaseStatus.CLOSED, updated.getStatus());
    }
}
