package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.DocumentGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for AI-powered legal document generation.
 * 
 * Accessible to LITIGANT and LAWYER roles.
 * Proxies to the Python LawGPT microservice for RAG-grounded document drafting.
 */
@RestController
@RequestMapping("/api/documents/generate")
@RequiredArgsConstructor
@Slf4j
public class DocumentGenerationController {

    private final DocumentGenerationService documentGenerationService;
    private final AuthService authService;

    /**
     * Generate a document preview (text only).
     * 
     * POST /api/documents/generate/preview
     * 
     * Request body: {
     *   "docType": "affidavit|rti|complaint|notice",
     *   "petitionerName": "string",
     *   "petitionerAddress": "string",
     *   "respondentName": "string",
     *   "respondentAddress": "string",
     *   "caseDescription": "string",
     *   "incidentDate": "string",
     *   "reliefSought": "string",
     *   "courtName": "string (optional)",
     *   "departmentName": "string (RTI only)",
     *   "pioName": "string (RTI only)"
     * }
     */
    @PostMapping("/preview")
    public ResponseEntity<?> generatePreview(
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        try {
            User user = authService.findByEmail(authentication.getName());
            
            // Role check: only LITIGANT and LAWYER allowed
            if (!isAllowedRole(user)) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "Only litigants and lawyers can generate documents"
                ));
            }

            log.info("📝 Document preview requested by {} ({})", user.getName(), user.getRole());
            Map<String, Object> result = documentGenerationService.generatePreview(request);
            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("unavailable")) {
                return ResponseEntity.status(503).body(Map.of("error", msg));
            }
            log.error("Document preview error: {}", msg);
            return ResponseEntity.status(502).body(Map.of("error", msg != null ? msg : "Generation failed"));
        } catch (Exception e) {
            log.error("Unexpected error in document preview: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Generate a document and download as PDF.
     * 
     * POST /api/documents/generate/download
     * 
     * Same request body as /preview.
     * Returns: PDF file as application/pdf with Content-Disposition: attachment
     */
    @PostMapping("/download")
    public ResponseEntity<?> generateDownload(
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        try {
            User user = authService.findByEmail(authentication.getName());

            // Role check: only LITIGANT and LAWYER allowed
            if (!isAllowedRole(user)) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "Only litigants and lawyers can generate documents"
                ));
            }

            log.info("📄 PDF download requested by {} ({})", user.getName(), user.getRole());

            byte[] pdfBytes = documentGenerationService.generatePdf(request);

            // Calculate SHA-256 hash for integrity
            String sha256Hash = documentGenerationService.calculateSha256(pdfBytes);
            log.info("📄 PDF generated, SHA-256: {}", sha256Hash.substring(0, 16) + "...");

            // Build filename
            String docType = request.get("docType") != null ? request.get("docType").toString() : "document";
            String petitioner = request.get("petitionerName") != null
                    ? request.get("petitionerName").toString().replace(" ", "_")
                    : "user";
            String filename = docType + "_" + petitioner + ".pdf";

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header("X-Document-Hash", sha256Hash)
                    .body(pdfBytes);

        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("unavailable")) {
                return ResponseEntity.status(503).body(Map.of("error", msg));
            }
            log.error("PDF download error: {}", msg);
            return ResponseEntity.status(502).body(Map.of("error", msg != null ? msg : "PDF generation failed"));
        } catch (Exception e) {
            log.error("Unexpected error in PDF download: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Check if the user's role is allowed to generate documents.
     * Only LITIGANT and LAWYER roles are permitted.
     */
    private boolean isAllowedRole(User user) {
        if (user == null || user.getRole() == null) return false;
        String role = user.getRole().name();
        return "LITIGANT".equals(role) || "LAWYER".equals(role);
    }
}
