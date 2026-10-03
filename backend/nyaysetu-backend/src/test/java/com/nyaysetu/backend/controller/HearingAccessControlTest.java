package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.HearingParticipantRepository;
import com.nyaysetu.backend.repository.HearingRepository;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class HearingAccessControlTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private CaseRepository caseRepository;
    @Autowired private HearingRepository hearingRepository;
    @Autowired private HearingParticipantRepository participantRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private User client;
    private User lawyer;
    private User judge;
    private User admin;
    private User unrelatedUser;
    private CaseEntity caseEntity;
    private Hearing hearing;

    @BeforeEach
    void setUp() {
        String encodedPw = passwordEncoder.encode("password123");

        client = userRepository.save(User.builder()
                .email("client-hearing-test@example.com")
                .name("Client User")
                .password(encodedPw)
                .role(Role.LITIGANT)
                .build());

        lawyer = userRepository.save(User.builder()
                .email("lawyer-hearing-test@example.com")
                .name("Lawyer User")
                .password(encodedPw)
                .role(Role.LAWYER)
                .build());

        judge = userRepository.save(User.builder()
                .email("judge-hearing-test@example.com")
                .name("Judge User")
                .password(encodedPw)
                .role(Role.JUDGE)
                .build());

        admin = userRepository.save(User.builder()
                .email("admin-hearing-test@example.com")
                .name("Admin User")
                .password(encodedPw)
                .role(Role.ADMIN)
                .build());

        unrelatedUser = userRepository.save(User.builder()
                .email("unrelated-hearing-test@example.com")
                .name("Unrelated User")
                .password(encodedPw)
                .role(Role.LITIGANT)
                .build());

        caseEntity = caseRepository.save(CaseEntity.builder()
                .title("Test Case for Access Control")
                .client(client)
                .lawyer(lawyer)
                .assignedJudge("Judge User")
                .judgeId(judge.getId())
                .status(CaseStatus.IN_PROGRESS)
                .stage(CaseStage.EVIDENCE)
                .build());

        hearing = hearingRepository.save(Hearing.builder()
                .caseEntity(caseEntity)
                .scheduledDate(LocalDateTime.now().plusDays(1))
                .durationMinutes(60)
                .videoRoomId("hearing-test-room-01")
                .status(HearingStatus.SCHEDULED)
                .build());

        participantRepository.save(HearingParticipant.builder()
                .hearing(hearing)
                .user(client)
                .role(ParticipantRole.LITIGANT)
                .build());

        participantRepository.save(HearingParticipant.builder()
                .hearing(hearing)
                .user(lawyer)
                .role(ParticipantRole.LAWYER)
                .build());
    }

    // ===== NEGATIVE TESTS: Unauthorized users should get 403 =====

    @Test
    @WithMockUser(username = "unrelated-hearing-test@example.com", roles = {"LITIGANT"})
    void getHearing_unrelatedUser_shouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/{hearingId}", hearing.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "unrelated-hearing-test@example.com", roles = {"LITIGANT"})
    void getParticipants_unrelatedUser_shouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/{hearingId}/participants", hearing.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "unrelated-hearing-test@example.com", roles = {"LITIGANT"})
    void getCaseHearings_unrelatedUser_shouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/case/{caseId}", caseEntity.getId()))
                .andExpect(status().isForbidden());
    }

    // ===== POSITIVE TESTS: Authorized users should get 200 =====

    @Test
    @WithMockUser(username = "admin-hearing-test@example.com", roles = {"ADMIN"})
    void getHearing_admin_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/{hearingId}", hearing.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin-hearing-test@example.com", roles = {"ADMIN"})
    void getParticipants_admin_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/{hearingId}/participants", hearing.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin-hearing-test@example.com", roles = {"ADMIN"})
    void getCaseHearings_admin_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/case/{caseId}", caseEntity.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "judge-hearing-test@example.com", roles = {"JUDGE"})
    void getHearing_assignedJudge_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/{hearingId}", hearing.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "judge-hearing-test@example.com", roles = {"JUDGE"})
    void getParticipants_assignedJudge_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/{hearingId}/participants", hearing.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "judge-hearing-test@example.com", roles = {"JUDGE"})
    void getCaseHearings_assignedJudge_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/case/{caseId}", caseEntity.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "client-hearing-test@example.com", roles = {"LITIGANT"})
    void getHearing_caseClient_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/{hearingId}", hearing.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "client-hearing-test@example.com", roles = {"LITIGANT"})
    void getParticipants_caseClient_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/{hearingId}/participants", hearing.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "client-hearing-test@example.com", roles = {"LITIGANT"})
    void getCaseHearings_caseClient_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/case/{caseId}", caseEntity.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "lawyer-hearing-test@example.com", roles = {"LAWYER"})
    void getHearing_caseLawyer_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/{hearingId}", hearing.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "lawyer-hearing-test@example.com", roles = {"LAWYER"})
    void getParticipants_caseLawyer_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/{hearingId}/participants", hearing.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "lawyer-hearing-test@example.com", roles = {"LAWYER"})
    void getCaseHearings_caseLawyer_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/hearings/case/{caseId}", caseEntity.getId()))
                .andExpect(status().isOk());
    }

    // ===== UNMATCHED JUDGE: judge not assigned to this case should get 403 =====

    @Test
    @WithMockUser(username = "other-judge-hearing-test@example.com", roles = {"JUDGE"})
    void getHearing_unmatchedJudge_shouldReturn403() throws Exception {
        userRepository.save(User.builder()
                .email("other-judge-hearing-test@example.com")
                .name("Other Judge")
                .password(passwordEncoder.encode("password123"))
                .role(Role.JUDGE)
                .build());

        mockMvc.perform(get("/api/v1/hearings/{hearingId}", hearing.getId()))
                .andExpect(status().isForbidden());
    }
}
