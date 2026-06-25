package com.nyaysetu.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
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
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Requirement validation check: Unauthenticated requests to protected endpoints 
     * must return 401 Unauthorized or 403 Forbidden based on general security filters.
     */
    @Test
    public void unauthenticatedAccessToCasesPendingAssignment_ShouldBeRejected() throws Exception {
        mockMvc.perform(get("/cases/pending-assignment")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Requirement validation check: Authenticated users lacking proper high-privilege 
     * roles must hit a strict 403 Forbidden interceptor blockage on secure admin paths.
     */
    @Test
    @WithMockUser(roles = "LITIGANT")
    public void litigantAccessToJudgeWorkload_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/cases/judge-workload")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    /**
     * Requirement validation check: Authenticated users possessing authorized role mappings 
     * (e.g., ADMIN) must pass structural request-time validation filters smoothly.
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void adminAccessToPendingAssignmentCases_ShouldPassAuthorization() throws Exception {
        mockMvc.perform(get("/cases/pending-assignment")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    /**
     * Requirement validation check: Unauthenticated traffic trying to upload files to the 
     * case evidence repository must be instantly dropped at the filter perimeter.
     */
    @Test
    public void unauthenticatedAccessToEvidenceUpload_ShouldBeRejected() throws Exception {
        mockMvc.perform(post("/cases/123e4567-e89b-12d3-a456-426614174000/evidence")
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE))
                .andExpect(status().isUnauthorized());
    }
}
