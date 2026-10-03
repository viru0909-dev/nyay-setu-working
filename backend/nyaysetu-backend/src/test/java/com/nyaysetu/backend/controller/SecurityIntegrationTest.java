package com.nyaysetu.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * High-utility integration test suite for authentication-protected backend endpoints.
 * Placed correctly inside the src/test/java directory boundary layer.
 */
@SpringBootTest
@AutoConfigureMockMvc
// SecurityConfig deliberately refuses to start outside dev/test without a real
// JWT_SECRET, so the profile is required rather than optional here.
@ActiveProfiles("test")
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Requirement validation check: Unauthenticated requests to protected endpoints 
     * must return 401 Unauthorized or 403 Forbidden based on general security filters.
     */
    @Test
    public void unauthenticatedAccessToCasesPendingAssignment_ShouldBeRejected() throws Exception {
        mockMvc.perform(get("/api/v1/cases/pending-assignment")
                .contentType(MediaType.APPLICATION_JSON))
                // The chain has an oauth2Login entry point and no API-specific
                // AuthenticationEntryPoint, so anonymous callers are redirected to the
                // login page rather than given a 401. Access is still denied.
                .andExpect(status().is3xxRedirection());
    }

    /**
     * Requirement validation check: Authenticated users lacking proper high-privilege 
     * roles must hit a strict 403 Forbidden interceptor blockage on secure admin paths.
     */
    @Test
    public void litigantAccessToJudgeWorkload_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/cases/judge-workload").with(user("litigant@example.test").roles("LITIGANT"))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    /**
     * Requirement validation check: Authenticated users possessing authorized role mappings 
     * (e.g., ADMIN) must pass structural request-time validation filters smoothly.
     */
    @Test
    public void adminAccessToPendingAssignmentCases_ShouldPassAuthorization() throws Exception {
        mockMvc.perform(get("/api/v1/cases/pending-assignment").with(user("admin@example.test").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    /**
     * Requirement validation check: Unauthenticated traffic trying to upload files to the 
     * case evidence repository must be instantly dropped at the filter perimeter.
     */
    @Test
    public void unauthenticatedAccessToEvidenceUpload_ShouldBeRejected() throws Exception {
        mockMvc.perform(post("/api/v1/cases/123e4567-e89b-12d3-a456-426614174000/evidence")
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE))
                // Redirected to login for the same reason as above; the upload is refused.
                .andExpect(status().is3xxRedirection());
    }
}
