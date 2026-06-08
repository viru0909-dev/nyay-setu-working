package com.nyaysetu.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void unauthenticated_user_isDeniedForProtectedEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/cases"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unauthenticated_user_isDeniedForAiEndpoint() throws Exception {
        mockMvc.perform(get("/ai/chat"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "judge@example.com", roles = {"JUDGE"})
    void judgeRole_canAccessJudgeEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/judge/dashboard"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "judge@example.com", roles = {"JUDGE"})
    void csrf_isRequired_forStateChangingRequest() throws Exception {
        // Use a POST endpoint that is expected to be protected and state-changing.
        // With CSRF enabled, missing token should yield 403.
        mockMvc.perform(post("/api/v1/orders"))
                .andExpect(status().isForbidden());
    }
}

