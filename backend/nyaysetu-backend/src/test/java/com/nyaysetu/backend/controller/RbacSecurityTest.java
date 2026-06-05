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

    @TestConfiguration
    static class DummyTestController {
        @RestController
        static class InnerDummyController {
            @GetMapping("/api/v1/client/fir/test")
            public String litigantEndpoint() { return "Litigant OK"; }

            @GetMapping("/api/v1/lawyer/test")
            public String lawyerEndpoint() { return "Lawyer OK"; }
        }
    }

    @ParameterizedTest
    @CsvSource({
            "/api/v1/judge/cases",
            "/api/v1/cases/pending-assignment"
    })
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    public void shouldDenyLitigantAccess(String endpoint) throws Exception {
        mockMvc.perform(get(endpoint))
                .andExpect(status().isForbidden());
    }

    @ParameterizedTest
    @CsvSource({
            "/api/v1/judge/cases",
            "/api/v1/cases/pending-assignment"
    })
    @WithMockUser(username = "lawyer@example.com", roles = {"LAWYER"})
    public void shouldDenyLawyerAccess(String endpoint) throws Exception {
        mockMvc.perform(get(endpoint))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "litigant@example.com", roles = {"LITIGANT"})
    public void shouldAllowLitigantAccessToLitigantEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/client/fir/test"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "lawyer@example.com", roles = {"LAWYER"})
    public void shouldAllowLawyerAccessToLawyerEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/lawyer/test"))
                .andExpect(status().isOk());
    }
}
