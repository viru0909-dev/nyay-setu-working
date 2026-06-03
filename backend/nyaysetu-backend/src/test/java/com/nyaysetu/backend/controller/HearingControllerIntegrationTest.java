package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.HearingRepository;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class HearingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private HearingRepository hearingRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private ObjectMapper objectMapper = new ObjectMapper();

    private User judgeUser;
    private User lawyerUser;
    private User clientUser;
    private UUID caseId;

    @BeforeEach
    void setUp() {
        // Clear existing data
        hearingRepository.deleteAll();
        caseRepository.deleteAll();
        userRepository.deleteAll();

        // Create users
        judgeUser = createUser("judge@example.com", "Judge User", "password", Role.JUDGE);
        lawyerUser = createUser("lawyer@example.com", "Lawyer User", "password", Role.LAWYER);
        clientUser = createUser("client@example.com", "Client User", "password", Role.LITIGANT);

        // Create a case with the lawyer and client
        CaseEntity caseEntity = CaseEntity.builder()
                .title("Test Case")
                .caseType("CIVIL")
                .status(CaseStatus.NEW)
                .client(clientUser)
                .lawyer(lawyerUser)
                .judgeId(judgeUser.getId())
                .assignedJudge(judgeUser.getName())
                .build();
        caseEntity = caseRepository.save(caseEntity);
        caseId = caseEntity.getId();

        // Save the users (already saved in createUser, but we need to save the case with the users)
        // The case is saved above.
    }

    private User createUser(String email, String name, String password, Role role) {
        User user = User.builder()
                .email(email)
                .name(name)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build();
        return userRepository.save(user);
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        var loginRequest = Map.of(
                "email", email,
                "password", password
        );
        var response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse();

        var responseBody = objectMapper.readValue(response.getContentAsString(), Map.class);
        return (String) responseBody.get("token");
    }

    @Test
    void scheduleHearing_returnsVideoRoomId_andJoinHearing_returnsSameVideoRoomId() throws Exception {
        // 1. Login as judge to schedule the hearing
        String judgeToken = loginAndGetToken("judge@example.com", "password");

        // 2. Schedule a hearing
        var scheduleRequest = Map.of(
                "caseId", caseId.toString(),
                "scheduledDate", LocalDateTime.now().plusDays(1).toString(),
                "durationMinutes", 30
        );
        var scheduleResponse = mockMvc.perform(post("/api/v1/hearings/schedule")
                        .header("Authorization", "Bearer " + judgeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scheduleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videoRoomId").exists())
                .andReturn()
                .getResponse();

        var scheduleResponseBody = objectMapper.readValue(scheduleResponse.getContentAsString(), Map.class);
        String videoRoomIdFromSchedule = (String) scheduleResponseBody.get("videoRoomId");
        UUID hearingId = UUID.fromString((String) scheduleResponseBody.get("id"));

        assertThat(videoRoomIdFromSchedule).matches("hearing-[0-9a-f]{12}");

        // 3. Login as lawyer to join the hearing
        String lawyerToken = loginAndGetToken("lawyer@example.com", "password");

        // 4. Join the hearing
        var joinResponse = mockMvc.perform(post("/api/v1/hearings/{hearingId}/join", hearingId)
                        .header("Authorization", "Bearer " + lawyerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.videoRoomId").value(videoRoomIdFromSchedule))
                .andExpect(jsonPath("$.hearingId").value(hearingId.toString()))
                .andReturn()
                .getResponse();

        // 5. Verify the response contains the same videoRoomId
        var joinResponseBody = objectMapper.readValue(joinResponse.getContentAsString(), Map.class);
        String videoRoomIdFromJoin = (String) joinResponseBody.get("videoRoomId");

        assertThat(videoRoomIdFromJoin).isEqualTo(videoRoomIdFromSchedule);
    }
}