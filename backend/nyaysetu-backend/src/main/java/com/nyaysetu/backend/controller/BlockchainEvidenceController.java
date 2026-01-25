package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.EvidenceRecord;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.BlockchainEvidenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * Controller for blockchain-secured evidence management
 */
@RestController
@RequestMapping("/api/evidence")
@RequiredArgsConstructor
@Slf4j
public class BlockchainEvidenceController {

    private final BlockchainEvidenceService evidenceService;
    private final com.nyaysetu.backend.service.CertificateService certificateService;
    private final UserRepository userRepository;

    /**
     * Upload evidence with blockchain hash
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadEvidence(
            @RequestParam("file") MultipartFile file,
            @RequestParam("caseId") UUID caseId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "evidenceType", defaultValue = "DOCUMENT") String evidenceType,
            jakarta.servlet.http.HttpServletRequest request) {
        
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            EvidenceRecord evidence = evidenceService.uploadEvidence(
                    caseId, file, title, description, evidenceType, currentUser, request.getRemoteAddr());

            Map<String, Object> response = new HashMap<>();
            response.put("id", evidence.getId());
            response.put("title", evidence.getTitle());
            response.put("blockHash", evidence.getBlockHash());
            response.put("blockIndex", evidence.getBlockIndex());
            response.put("verificationStatus", evidence.getVerificationStatus());
            response.put("message", "Evidence uploaded and secured with blockchain hash");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to upload evidence", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all evidence for a case
     */
    @GetMapping("/case/{caseId}")
    public ResponseEntity<?> getEvidenceByCase(@PathVariable UUID caseId) {
        try {
            List<EvidenceRecord> evidence = evidenceService.getEvidenceByCase(caseId);
            
            List<Map<String, Object>> response = evidence.stream().map(e -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", e.getId());
                item.put("title", e.getTitle());
                item.put("description", e.getDescription());
                item.put("evidenceType", e.getEvidenceType());
                item.put("fileName", e.getFileName());
                item.put("fileSize", e.getFileSize());
                item.put("blockHash", e.getBlockHash());
                item.put("blockIndex", e.getBlockIndex());
                item.put("verificationStatus", e.getVerificationStatus());
                item.put("isVerified", e.getIsVerified());
                item.put("createdAt", e.getCreatedAt());
                item.put("uploadedByRole", e.getUploadedByRole());
                return item;
            }).toList();

            return ResponseEntity.ok(Map.of(
                    "caseId", caseId,
                    "totalCount", evidence.size(),
                    "evidence", response
            ));
        } catch (Exception e) {
            log.error("Failed to get evidence for case {}", caseId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Verify single evidence integrity
     */
    @GetMapping("/{evidenceId}/verify")
    public ResponseEntity<?> verifyEvidence(@PathVariable UUID evidenceId) {
        try {
            Map<String, Object> result = evidenceService.verifyEvidence(evidenceId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to verify evidence {}", evidenceId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Verify entire evidence chain for a case
     */
    @GetMapping("/case/{caseId}/verify-chain")
    public ResponseEntity<?> verifyChain(@PathVariable UUID caseId) {
        try {
            Map<String, Object> result = evidenceService.verifyChain(caseId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to verify chain for case {}", caseId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get evidence details by ID
     */
    @GetMapping("/{evidenceId}")
    public ResponseEntity<?> getEvidence(@PathVariable UUID evidenceId) {
        try {
            EvidenceRecord evidence = evidenceService.getEvidenceById(evidenceId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", evidence.getId());
            response.put("title", evidence.getTitle());
            response.put("description", evidence.getDescription());
            response.put("evidenceType", evidence.getEvidenceType());
            response.put("fileName", evidence.getFileName());
            response.put("fileSize", evidence.getFileSize());
            response.put("contentType", evidence.getContentType());
            response.put("fileHash", evidence.getFileHash());
            response.put("blockHash", evidence.getBlockHash());
            response.put("previousBlockHash", evidence.getPreviousBlockHash());
            response.put("blockIndex", evidence.getBlockIndex());
            response.put("verificationStatus", evidence.getVerificationStatus());
            response.put("isVerified", evidence.getIsVerified());
            response.put("createdAt", evidence.getCreatedAt());
            response.put("uploadedByRole", evidence.getUploadedByRole());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get evidence {}", evidenceId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Download Section 63(4) Certificate
     */
    @GetMapping(value = "/{evidenceId}/certificate", produces = org.springframework.http.MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable UUID evidenceId) {
        try {
            byte[] pdfBytes = certificateService.generateCertificate(evidenceId);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=certificate-" + evidenceId + ".pdf")
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            log.error("Failed to generate certificate", e);
            return ResponseEntity.badRequest().build();
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        String email = auth.getName();
        return userRepository.findByEmail(email).orElse(null);
    }
}
