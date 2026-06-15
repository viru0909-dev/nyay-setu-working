package com.nyaysetu.backend.controller;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@ActiveProfiles("test")
class RbacSecurityTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    void shouldDenyLitigantAccessToJudgeEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/judge/cases"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    void shouldDenyLitigantAccessToAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/cases/pending-assignment"))
                .andExpect(status().isForbidden());
    }
    @Test
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    void shouldAllowLitigantAccessToOwnCases() throws Exception {
        mockMvc.perform(get("/api/v1/cases"))
                .andExpect(status().isOk());
}
}
