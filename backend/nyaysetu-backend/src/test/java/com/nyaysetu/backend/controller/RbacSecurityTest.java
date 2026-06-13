package com.nyaysetu.backend.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(RbacSecurityTest.DummyTestController.class)
public class RbacSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @RestController
    static class DummyTestController {
        @GetMapping("/api/v1/client/fir/test")
        public String litigantEndpoint() { return "Litigant OK"; }

        @GetMapping("/api/v1/lawyer/test")
        public String lawyerEndpoint() { return "Lawyer OK"; }
    }

    @ParameterizedTest
    @CsvSource({
            "/api/v1/judge/cases",
            "/api/v1/cases/pending-assignment"
    })
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    public void shouldDenyLitigantAccess(String endpoint) {
        try {
            mockMvc.perform(get(endpoint))
                    .andExpect(status().isForbidden());
        } catch (Exception e) {
            throw new AssertionError("MockMvc call failed", e);
        }
    }

    @ParameterizedTest
    @CsvSource({
            "/api/v1/judge/cases",
            "/api/v1/cases/pending-assignment"
    })
    @WithMockUser(username = "lawyer@example.com", roles = {"LAWYER"})
    public void shouldDenyLawyerAccess(String endpoint) {
        try {
            mockMvc.perform(get(endpoint))
                    .andExpect(status().isForbidden());
        } catch (Exception e) {
            throw new AssertionError("MockMvc call failed", e);
        }
    }

    @Test
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    public void shouldAllowLitigantAccessToLitigantEndpoint() {
        try {
            mockMvc.perform(get("/api/v1/client/fir/test"))
                    .andExpect(status().isOk());
        } catch (Exception e) {
            throw new AssertionError("MockMvc call failed", e);
        }
    }

    @Test
    @WithMockUser(username = "lawyer@example.com", roles = {"LAWYER"})
    public void shouldAllowLawyerAccessToLawyerEndpoint() {
        try {
            mockMvc.perform(get("/api/v1/lawyer/test"))
                    .andExpect(status().isOk());
        } catch (Exception e) {
            throw new AssertionError("MockMvc call failed", e);
        }
    }
    @Test
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    public void shouldAllowLitigantAccessToOwnCases() throws Exception {
        mockMvc.perform(get("/api/v1/cases"))
                .andExpect(status().isOk());
}
}
