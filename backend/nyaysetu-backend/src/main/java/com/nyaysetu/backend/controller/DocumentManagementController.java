package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.DocumentDto;
import com.nyaysetu.backend.dto.CaseSummaryDto;
import com.nyaysetu.backend.dto.UploadDocumentRequest;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.CaseManagementService;
import com.nyaysetu.backend.service.DocumentManagementService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Tag(name = "Documents", description = "Upload, download and manage case documents")
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentManagementController {

    private final DocumentManagementService documentManagementService;
    private final CaseManagementService caseManagementService;
    private final AuthService authService;
    private final com.nyaysetu.backend.service.DocumentAnalysisService documentAnalysisService;
    private final com.nyaysetu.backend.service.CertificateService certificateService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "OTHER") String category,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam(value = "caseId", required = false) String caseIdStr,
            Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        try {
            User user = authService.findByEmail(authentication.getName());
            String uploadIp = getClientIp(request);
            UUID caseId = null;
            if (caseIdStr != null && !caseIdStr.isEmpty() && !caseIdStr.equals("null")) {
                try { caseId = UUID.fromString(caseIdStr); } catch (Exception ignored) {}
            }
            UploadDocumentRequest uploadRequest = UploadDocumentRequest.builder()
                .category(category).description(description).caseId(caseId).build();
            DocumentDto document = documentManagementService.uploadDocument(file, uploadRequest, user, uploadIp);
            try { documentManagementService.triggerAnalysis(document.getId()); } catch (Exception e) {
                log.warn("AI analysis trigger failed: {}", e.getMessage());
            }
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed"));
        }
    }

    private String getClientIp(jakarta.servlet.http.HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) ip = request.getHeader("X-Real-IP");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) ip = request.getRemoteAddr();
        if (ip != null && ip.contains(",")) ip = ip.split(",")[0].trim();
        return ip;
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<?> analyzeDocument(@PathVariable UUID id, Authentication authentication) {
        // SECURITY FIX (P0 — Finding 4): verify caller has access to this document before triggering analysis
        User user = authService.findByEmail(authentication.getName());
        DocumentDto doc = documentManagementService.getDocumentById(id);
        if (!isAuthorizedForDocument(doc, user)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
        try {
            documentManagementService.triggerAnalysis(id);
            return ResponseEntity.ok(Map.of("message", "Analysis started", "documentId", id.toString()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Analysis trigger failed"));
        }
    }

    @GetMapping("/{id}/analysis")
    public ResponseEntity<?> getDocumentAnalysis(@PathVariable UUID id, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        DocumentDto doc = documentManagementService.getDocumentById(id);
        if (!isAuthorizedForDocument(doc, user)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
        try {
            if (!documentAnalysisService.hasAnalysis(id)) return ResponseEntity.status(404).body(Map.of("error", "Analysis not found"));
            return ResponseEntity.ok(documentAnalysisService.getAnalysisByDocumentId(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to retrieve analysis"));
        }
    }

    @GetMapping("/{id}/has-analysis")
    public ResponseEntity<?> checkAnalysis(@PathVariable UUID id, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        DocumentDto doc = documentManagementService.getDocumentById(id);
        if (!isAuthorizedForDocument(doc, user)) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        try {
            return ResponseEntity.ok(Map.of("documentId", id.toString(), "hasAnalysis", documentAnalysisService.hasAnalysis(id)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Check failed"));
        }
    }

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getUserDocuments(Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        return ResponseEntity.ok(documentManagementService.getUserDocuments(user.getId()));
    }

    @GetMapping("/user/cases")
    public ResponseEntity<List<CaseSummaryDto>> getUserCases(Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        return ResponseEntity.ok(caseManagementService.getUserCaseSummaries(user));
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<DocumentDto>> getCaseDocuments(@PathVariable UUID caseId, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        com.nyaysetu.backend.dto.CaseDTO caseData = caseManagementService.getCaseById(caseId);
        String userRole = "VISITOR";
        if (user.getRole() == Role.JUDGE) userRole = "JUDGE";
        else if (caseData.getClientId() != null && caseData.getClientId().equals(user.getId())) userRole = "PETITIONER";
        else if (user.getEmail().equals(caseData.getRespondentEmail())) userRole = "RESPONDENT";
        return ResponseEntity.ok(documentManagementService.getCaseDocumentsWithAccessControl(caseId, user.getId(), userRole));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDocument(@PathVariable UUID id, Authentication authentication) {
        // SECURITY FIX (P0 — Finding 4): metadata endpoint now requires ownership check
        User user = authService.findByEmail(authentication.getName());
        DocumentDto document = documentManagementService.getDocumentById(id);
        if (!isAuthorizedForDocument(document, user)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadDocument(@PathVariable UUID id, Authentication authentication) {
        try {
            // SECURITY FIX (P0 — Finding 4): Document download had NO ownership check.
            // Any authenticated user could download any document by guessing the UUID.
            // Now: only the document owner, a JUDGE, or a POLICE officer may download.
            User user = authService.findByEmail(authentication.getName());
            DocumentDto metadata = documentManagementService.getDocumentById(id);

            if (!isAuthorizedForDocument(metadata, user)) {
                log.warn("Unauthorized download attempt: user {} tried to download document {}", user.getEmail(), id);
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            Resource resource = documentManagementService.downloadDocument(id);
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getFileName() + "\"")
                .body(resource);
        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("not found")) return ResponseEntity.status(404).body(Map.of("error", "Document not found"));
            return ResponseEntity.status(500).body(Map.of("error", "Download failed"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Unexpected error"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDocument(@PathVariable UUID id, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        documentManagementService.deleteDocument(id, user.getId());
        return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
    }

    @GetMapping("/{id}/certificate")
    public ResponseEntity<?> downloadCertificate(@PathVariable UUID id, Authentication authentication) {
        // SECURITY FIX: Ownership check before issuing legal certificate
        User user = authService.findByEmail(authentication.getName());
        DocumentDto doc = documentManagementService.getDocumentById(id);
        if (!isAuthorizedForDocument(doc, user)) return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        try {
            byte[] pdfBytes = certificateService.generateDocumentCertificate(id);
            return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Certificate_" + id + ".pdf\"")
                .body(pdfBytes);
        } catch (Exception e) {
            log.error("Certificate generation failed for document {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", "Certificate generation failed"));
        }
    }

    @GetMapping("/{id}/verify-hash")
    public ResponseEntity<?> verifyHash(@PathVariable UUID id) {
        boolean isValid = documentManagementService.verifyDocumentHash(id);
        return ResponseEntity.ok(Map.of("id", id, "valid", isValid));
    }

    /**
     * Authorization helper: returns true if the given user may access this document.
     * Policy: owner | JUDGE | POLICE | ADMIN
     */
    private boolean isAuthorizedForDocument(DocumentDto document, User user) {
        if (user.getRole() == Role.JUDGE || user.getRole() == Role.POLICE || user.getRole() == Role.ADMIN) {
            return true;
        }
        // Owners are identified by the uploadedBy field on the document DTO
        return document.getUploadedBy() != null && document.getUploadedBy().equals(user.getId());
    }
}
