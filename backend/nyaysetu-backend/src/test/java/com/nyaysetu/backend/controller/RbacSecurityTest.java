package com.nyaysetu.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RbacSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    public void shouldDenyLitigantAccessToJudgeEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/judge/cases"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    public void shouldDenyLitigantAccessToAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/cases/pending-assignment"))
                .andExpect(status().isForbidden());
    }
    @Test
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    public void shouldAllowLitigantAccessToOwnCases() throws Exception {
        mockMvc.perform(get("/api/v1/cases"))
                .andExpect(status().isOk());
}
}
