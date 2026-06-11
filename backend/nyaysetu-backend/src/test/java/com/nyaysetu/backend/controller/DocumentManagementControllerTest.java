package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.CaseManagementService;
import com.nyaysetu.backend.service.DocumentAnalysisService;
import com.nyaysetu.backend.service.DocumentManagementService;
import com.nyaysetu.backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentManagementControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private JwtService jwtService;

    @Mock
    private DocumentManagementService documentManagementService;

    @Mock
    private CaseManagementService caseManagementService;

    @Mock
    private com.nyaysetu.backend.service.CaseAccessService caseAccessService;

    @Mock
    private DocumentAnalysisService documentAnalysisService;

    @Mock
    private com.nyaysetu.backend.service.CertificateService certificateService;

    private DocumentManagementController controller;

    @BeforeEach
    void setUp() {
        controller = new DocumentManagementController(
                documentManagementService,
                caseManagementService,
                authService,
                caseAccessService,
                documentAnalysisService,
                certificateService
        );
    }

    @Test
    void downloadCertificate_shouldReturn500WhenCertificateGenerationFails() throws Exception {
        UUID documentId = UUID.randomUUID();

        User user = User.builder()
                .id(1L)
                .email("user@example.com")
                .name("Test User")
                .role(Role.LAWYER)
                .build();

        when(authService.findByEmail("user@example.com")).thenReturn(user);
        doNothing().when(documentManagementService).ensureDocumentAccess(documentId, 1L, "LAWYER");
        when(certificateService.generateDocumentCertificate(documentId))
                .thenThrow(new RuntimeException("Generator failure"));

        Authentication auth = new UsernamePasswordAuthenticationToken("user@example.com", null);

        ResponseEntity<?> response = controller.downloadCertificate(documentId, auth);

        assertEquals(500, response.getStatusCode().value());
        assertNotNull(response.getBody());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("Certificate generation failed: Generator failure", body.get("error"));
    }
}
