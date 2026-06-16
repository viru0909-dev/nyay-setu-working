package com.nyaysetu.backend.controller;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@ActiveProfiles("test")
@Import(RbacSecurityTest.DummyTestController.class)
class RbacSecurityTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @RestController
    static class DummyTestController {
        @GetMapping("/api/v1/client/fir/test")
        public String litigantEndpoint() { return "Litigant OK"; }

        @GetMapping("/api/v1/lawyer/test")
        public String lawyerEndpoint() { return "Lawyer OK"; }
    }

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @ParameterizedTest
    @CsvSource({
            "/api/v1/judge/cases",
            "/api/v1/cases/pending-assignment"
    })
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    void shouldDenyLitigantAccess(String endpoint) throws Exception {
        mockMvc.perform(get(endpoint))
                .andExpect(status().isForbidden());
    }

    @ParameterizedTest
    @CsvSource({
            "/api/v1/judge/cases",
            "/api/v1/cases/pending-assignment"
    })
    @WithMockUser(username = "lawyer@example.com", roles = {"LAWYER"})
    void shouldDenyLawyerAccess(String endpoint) throws Exception {
        mockMvc.perform(get(endpoint))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    void shouldAllowLitigantAccessToLitigantEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/client/fir/test"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "lawyer@example.com", roles = {"LAWYER"})
    void shouldAllowLawyerAccessToLawyerEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/lawyer/test"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    void shouldAllowLitigantAccessToOwnCases() throws Exception {
        mockMvc.perform(get("/api/v1/cases"))
                .andExpect(status().isOk());
    }
}
