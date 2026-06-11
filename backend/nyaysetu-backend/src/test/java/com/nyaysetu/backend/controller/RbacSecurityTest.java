package com.nyaysetu.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RbacSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void shouldDenyLitigantAccessToJudgeEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/judge/cases")
                        .with(user("litigant@nyay.com").roles("LITIGANT")))
                .andExpect(status().isForbidden());
    }

    @Test
    public void shouldDenyLitigantAccessToAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/cases/pending-assignment")
                        .with(user("litigant@nyay.com").roles("LITIGANT")))
                .andExpect(status().isForbidden());
    }

    @Test
    public void shouldAllowLitigantAccessToOwnCases() throws Exception {
        mockMvc.perform(get("/api/v1/cases")
                        .with(user("litigant@nyay.com").roles("LITIGANT")))
                .andExpect(status().isOk());
    }
}
