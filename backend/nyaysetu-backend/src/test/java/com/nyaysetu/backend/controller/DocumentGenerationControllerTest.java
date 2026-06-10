package com.nyaysetu.backend.controller;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.DocumentGenerationService;

import org.springframework.security.core.userdetails.UserDetailsService;
import com.nyaysetu.backend.service.JwtService;

@WebMvcTest(DocumentGenerationController.class)
@AutoConfigureMockMvc(addFilters = false)
class DocumentGenerationControllerTest {

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private DocumentGenerationService documentGenerationService;

    @Test
    void previewEndpoint_shouldReturnPreviewForAllowedRole() throws Exception {
        User user = User.builder()
                .id(1L)
                .email("user@example.com")
                .name("Test User")
                .role(Role.LITIGANT)
                .build();

        when(authService.findByEmail("user@example.com")).thenReturn(user);
        when(documentGenerationService.generatePreview(anyMap())).thenReturn(Map.of(
                "docType", "affidavit",
                "title", "Draft Affidavit",
                "content", "This is a preview",
                "sources", java.util.List.of("Section 1"),
                "generatedAt", "2026-06-02T12:00:00Z"
        ));

        Authentication auth = new UsernamePasswordAuthenticationToken("user@example.com", null);

        mockMvc.perform(post("/api/v1/documents/generate/preview")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"docType\":\"affidavit\",\"petitionerName\":\"Alex\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.docType").value("affidavit"))
                .andExpect(jsonPath("$.content").value("This is a preview"));
    }

    @Test
    void previewEndpoint_shouldRejectUnauthorizedRole() throws Exception {
        User user = User.builder()
                .id(2L)
                .email("admin@example.com")
                .name("Admin User")
                .role(Role.ADMIN)
                .build();

        when(authService.findByEmail("admin@example.com")).thenReturn(user);

        Authentication auth = new UsernamePasswordAuthenticationToken("admin@example.com", null);

        mockMvc.perform(post("/api/v1/documents/generate/preview")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"docType\":\"notice\",\"petitionerName\":\"Alex\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Only litigants and lawyers can generate documents"));
    }

    @Test
    void downloadPdfEndpoint_shouldReturnPdfAttachment() throws Exception {
        User user = User.builder()
                .id(3L)
                .email("lawyer@example.com")
                .name("Lawyer User")
                .role(Role.LAWYER)
                .build();

        when(authService.findByEmail("lawyer@example.com")).thenReturn(user);
        when(documentGenerationService.generatePdf(anyMap())).thenReturn("PDF-BYTES".getBytes(StandardCharsets.UTF_8));
        when(documentGenerationService.calculateSha256(any(byte[].class))).thenReturn("dummyhash1234567890");

        Authentication auth = new UsernamePasswordAuthenticationToken("lawyer@example.com", null);

        mockMvc.perform(post("/api/v1/documents/generate/download")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"docType\":\"notice\",\"petitionerName\":\"Alex\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"notice_Alex.pdf\""))
                .andExpect(header().string("X-Document-Hash", "dummyhash1234567890"))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void downloadDocxEndpoint_shouldReturnDocxAttachment() throws Exception {
        User user = User.builder()
                .id(4L)
                .email("lawyer2@example.com")
                .name("Lawyer User")
                .role(Role.LAWYER)
                .build();

        when(authService.findByEmail("lawyer2@example.com")).thenReturn(user);
        when(documentGenerationService.generateDocx(anyMap())).thenReturn("DOCX-BYTES".getBytes(StandardCharsets.UTF_8));

        Authentication auth = new UsernamePasswordAuthenticationToken("lawyer2@example.com", null);

        mockMvc.perform(post("/api/v1/documents/generate/download/docx")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"docType\":\"notice\",\"petitionerName\":\"Alex\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"notice_Alex.docx\""))
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
    }
}
