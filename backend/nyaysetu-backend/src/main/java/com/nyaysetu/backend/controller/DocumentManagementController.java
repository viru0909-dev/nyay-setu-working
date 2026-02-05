package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.DocumentDto;
import com.nyaysetu.backend.dto.CaseSummaryDto;
import com.nyaysetu.backend.dto.UploadDocumentRequest;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.CaseManagementService;
import com.nyaysetu.backend.service.DocumentManagementService;
import lombok.RequiredArgsConstructor;
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
            
            // Extract client IP address for audit trail
            String uploadIp = getClientIp(request);
            
            UUID caseId = null;
            if (caseIdStr != null && !caseIdStr.isEmpty() && !caseIdStr.equals("null")) {
                try {
                    caseId = UUID.fromString(caseIdStr);
                } catch (Exception e) {
                    // Invalid UUID, ignore
                }
            }
            
            UploadDocumentRequest uploadRequest = UploadDocumentRequest.builder()
                    .category(category)
                    .description(description)
                    .caseId(caseId)
                    .build();

            DocumentDto document = documentManagementService.uploadDocument(file, uploadRequest, user, uploadIp);
            
            // Auto-trigger AI verification
            try {
                documentManagementService.triggerAnalysis(document.getId());
            } catch (Exception e) {
                // Log but don't fail upload if analysis fails
                System.out.println("AI analysis trigger failed: " + e.getMessage());
            }
            
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Extract client IP address from request
     */
    private String getClientIp(jakarta.servlet.http.HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Handle multiple IPs in X-Forwarded-For
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    /**
     * Trigger AI analysis for a document
     */
    @PostMapping("/{id}/analyze")
    public ResponseEntity<?> analyzeDocument(@PathVariable UUID id) {
        try {
            // Trigger async analysis
            documentManagementService.triggerAnalysis(id);
            return ResponseEntity.ok(Map.of(
                "message", "Analysis started",
                "documentId", id.toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get AI analysis for a document
     */
    @GetMapping("/{id}/analysis")
    public ResponseEntity<?> getDocumentAnalysis(@PathVariable UUID id) {
        try {
            if (!documentAnalysisService.hasAnalysis(id)) {
                return ResponseEntity.status(404).body(Map.of("error", "Analysis not found"));
            }
            
            com.nyaysetu.backend.entity.DocumentAnalysis analysis = 
                documentAnalysisService.getAnalysisByDocumentId(id);
                
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check if document has analysis
     */
    @GetMapping("/{id}/has-analysis")
    public ResponseEntity<?> checkAnalysis(@PathVariable UUID id) {
        try {
            boolean hasAnalysis = documentAnalysisService.hasAnalysis(id);
            return ResponseEntity.ok(Map.of(
                "documentId", id.toString(),
                "hasAnalysis", hasAnalysis
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getUserDocuments(Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        List<DocumentDto> documents = documentManagementService.getUserDocuments(user.getId());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/user/cases")
    public ResponseEntity<List<CaseSummaryDto>> getUserCases(Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        List<CaseSummaryDto> cases = caseManagementService.getUserCaseSummaries(user);
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<DocumentDto>> getCaseDocuments(
            @PathVariable UUID caseId,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        
        // Get the case to determine user's role
        com.nyaysetu.backend.dto.CaseDTO caseData = caseManagementService.getCaseById(caseId);
        
        // Determine user's role in this case
        String userRole = "VISITOR"; // Default
        if (user.getRole() == com.nyaysetu.backend.entity.Role.JUDGE) {
            userRole = "JUDGE";
        } else if (caseData.getClientId() != null && caseData.getClientId().equals(user.getId())) {
            userRole = "PETITIONER";
        } else if (user.getEmail().equals(caseData.getRespondentEmail())) {
            userRole = "RESPONDENT";
        }
        
        // Get filtered documents based on role
        List<DocumentDto> documents = documentManagementService.getCaseDocumentsWithAccessControl(
            caseId, user.getId(), userRole
        );
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getDocument(@PathVariable UUID id) {
        DocumentDto document = documentManagementService.getDocumentById(id);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadDocument(@PathVariable UUID id) {
        try {
            DocumentDto metadata = documentManagementService.getDocumentById(id);
            Resource resource = documentManagementService.downloadDocument(id);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(metadata.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getFileName() + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg.contains("not found")) {
                return ResponseEntity.status(404).body(Map.of("error", msg));
            }
            return ResponseEntity.status(500).body(Map.of("error", "Download failed: " + msg));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Unexpected error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        documentManagementService.deleteDocument(id, user.getId());
        return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
    }

    /**
     * Download Section 63(4) Evidence Certificate for a document
     */
    @GetMapping("/{id}/certificate")
    public ResponseEntity<?> downloadCertificate(@PathVariable UUID id) {
        try {
            byte[] pdfBytes = certificateService.generateDocumentCertificate(id);
            
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"Certificate_" + id + ".pdf\"")
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace(); // Log stack trace to console
            return ResponseEntity.status(500).body(Map.of("error", "Certificate generation failed: " + e.getMessage()));
        }
    }
    /**
     * Verify document hash (SHA-256) againts stored fingerprint
     */
    @GetMapping("/{id}/verify-hash")
    public ResponseEntity<?> verifyHash(@PathVariable UUID id) {
        boolean isValid = documentManagementService.verifyDocumentHash(id);
        return ResponseEntity.ok(Map.of("id", id, "valid", isValid));
    }
}
