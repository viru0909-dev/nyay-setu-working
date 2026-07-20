package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.DocumentDto;
import com.nyaysetu.backend.dto.CaseSummaryDto;
import com.nyaysetu.backend.dto.UploadDocumentRequest;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.CaseManagementService;
import com.nyaysetu.backend.service.DocumentManagementService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentManagementController {

    private final DocumentManagementService documentManagementService;
    private final CaseManagementService caseManagementService;
    private final AuthService authService;
    private final com.nyaysetu.backend.service.CaseAccessService caseAccessService;
    private final com.nyaysetu.backend.service.DocumentAnalysisService documentAnalysisService;
    private final com.nyaysetu.backend.service.CertificateService certificateService;

    @Operation(summary = "Upload a document", description = "Upload a case or evidence document with automatic SHA-256 fingerprinting")
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
                try {
                    caseId = UUID.fromString(caseIdStr);
                } catch (Exception e) {
                }
            }
            
            UploadDocumentRequest uploadRequest = UploadDocumentRequest.builder()
                    .category(category)
                    .description(description)
                    .caseId(caseId)
                    .build();

            DocumentDto document = documentManagementService.uploadDocument(file, uploadRequest, user, uploadIp);
            
            try {
                documentManagementService.triggerAnalysis(document.getId());
            } catch (Exception e) {
                log.warn("AI analysis trigger failed: {}", e.getMessage());
            }
            
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    private String getClientIp(jakarta.servlet.http.HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    @Operation(summary = "Trigger AI analysis on document", description = "Asynchronously trigger AI legal analysis for an uploaded document")
    @PostMapping("/{id}/analyze")
    public ResponseEntity<?> analyzeDocument(@PathVariable UUID id, Authentication authentication) {
        try {
            User user = authService.findByEmail(authentication.getName());
            documentManagementService.ensureDocumentAccess(id, user.getId(), user.getRole().name());

            documentManagementService.triggerAnalysis(id);
            return ResponseEntity.ok(Map.of(
                "message", "Analysis started",
                "documentId", id.toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Get AI document analysis", description = "Fetch existing AI analysis report for document")
    @GetMapping("/{id}/analysis")
    public ResponseEntity<?> getDocumentAnalysis(@PathVariable UUID id, Authentication authentication) {
        try {
            User user = authService.findByEmail(authentication.getName());
            documentManagementService.ensureDocumentAccess(id, user.getId(), user.getRole().name());

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

    @Operation(summary = "Check if document has AI analysis", description = "Verify whether document analysis exists")
    @GetMapping("/{id}/has-analysis")
    public ResponseEntity<?> checkAnalysis(@PathVariable UUID id, Authentication authentication) {
        try {
            User user = authService.findByEmail(authentication.getName());
            documentManagementService.ensureDocumentAccess(id, user.getId(), user.getRole().name());

            boolean hasAnalysis = documentAnalysisService.hasAnalysis(id);
            return ResponseEntity.ok(Map.of(
                "documentId", id.toString(),
                "hasAnalysis", hasAnalysis
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Get current user documents", description = "Retrieve paginated list of documents uploaded by current user")
    @GetMapping
    public ResponseEntity<Page<DocumentDto>> getUserDocuments(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        User user = authService.findByEmail(authentication.getName());
        Page<DocumentDto> documents = documentManagementService.getUserDocuments(user.getId(), pageable);
        return ResponseEntity.ok(documents);
    }

    @Operation(summary = "Get user case summaries", description = "Retrieve cases associated with user for document attachment")
    @GetMapping("/user/cases")
    public ResponseEntity<Page<CaseSummaryDto>> getUserCases(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        User user = authService.findByEmail(authentication.getName());
        Page<CaseSummaryDto> cases = caseManagementService.getUserCaseSummaries(user, pageable);
        return ResponseEntity.ok(cases);
    }

    @Operation(summary = "Get case documents", description = "Fetch documents attached to a specific case with role-based access control")
    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<DocumentDto>> getCaseDocuments(
            @PathVariable UUID caseId,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        
        com.nyaysetu.backend.dto.CaseDTO caseData = caseManagementService.getCaseById(caseId);
        
        String userRole = "VISITOR";
        if (user.getRole() == com.nyaysetu.backend.entity.Role.JUDGE) {
            userRole = "JUDGE";
        } else if (caseData.getLawyerId() != null && caseData.getLawyerId().equals(user.getId())) {
            userRole = "LAWYER";
        } else if (user.getRole() == com.nyaysetu.backend.entity.Role.LAWYER) {
            userRole = "LAWYER";
        } else if (caseData.getClientId() != null && caseData.getClientId().equals(user.getId())) {
            userRole = "PETITIONER";
        } else if (user.getEmail().equals(caseData.getRespondentEmail())) {
            userRole = "RESPONDENT";
        } else if (caseData.getLawyerId() != null && caseData.getLawyerId().equals(user.getId())) {
            userRole = "LAWYER";
        }

        boolean isCaseLawyer = caseData.getLawyerId() != null && caseData.getLawyerId().equals(user.getId());
        
        List<DocumentDto> documents = documentManagementService.getCaseDocumentsWithAccessControl(
            caseId, user.getId(), userRole, isCaseLawyer
        );
        return ResponseEntity.ok(documents);
    }

    @Operation(summary = "Get document metadata", description = "Fetch metadata for a specific document by ID")
    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getDocument(
            @PathVariable UUID id,
            Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        DocumentDto document = documentManagementService.getDocumentById(id, user);
        return ResponseEntity.ok(document);
    }

    @Operation(summary = "Download document binary", description = "Download raw file content of document")
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadDocument(
            @PathVariable UUID id,
            Authentication authentication) {
        try {
            User user = authService.findByEmail(authentication.getName());
            DocumentDto metadata = documentManagementService.getDocumentById(id, user);
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

    @Operation(summary = "Delete document", description = "Remove document file and metadata")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        documentManagementService.deleteDocument(id, user.getId());
        return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
    }

    @Operation(summary = "Download Section 63(4) evidence certificate", description = "Generate and download BSA Section 63(4) digital certificate PDF")
    @GetMapping("/{id}/certificate")
    public ResponseEntity<?> downloadCertificate(@PathVariable UUID id, Authentication authentication) {
        try {
            User user = authService.findByEmail(authentication.getName());
            documentManagementService.ensureDocumentAccess(id, user.getId(), user.getRole().name());

            byte[] pdfBytes = certificateService.generateDocumentCertificate(id);
            
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"Certificate_" + id + ".pdf\"")
                    .body(pdfBytes);
        } catch (Exception e) {
            log.error("Certificate generation failed for document {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", "Certificate generation failed: " + e.getMessage()));
        }
    }

    @Operation(summary = "Verify document SHA-256 fingerprint", description = "Re-hash file on disk against recorded SHA-256 fingerprint")
    @GetMapping("/{id}/verify-hash")
    public ResponseEntity<?> verifyHash(@PathVariable UUID id, Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        documentManagementService.ensureDocumentAccess(id, user.getId(), user.getRole().name());

        boolean isValid = documentManagementService.verifyDocumentHash(id);
        return ResponseEntity.ok(Map.of("id", id, "valid", isValid));
    }
}
