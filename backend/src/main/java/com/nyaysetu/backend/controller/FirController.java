package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.FirUploadRequest;
import com.nyaysetu.backend.dto.FirUploadResponse;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.FirService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/police")
@RequiredArgsConstructor
@Slf4j
public class FirController {

    private final FirService firService;
    private final UserRepository userRepository;
    private final com.nyaysetu.backend.repository.CaseRepository caseRepository;

    /**
     * Get pending summons delivery tasks for police
     */
    @GetMapping("/summons/pending")
    public ResponseEntity<?> getSummonsTasks() {
        try {
            // Find cases where summons status is IN_TRANSIT
            List<com.nyaysetu.backend.entity.CaseEntity> cases = caseRepository.findAll().stream()
                .filter(c -> "IN_TRANSIT".equals(c.getSummonsStatus()))
                .collect(java.util.stream.Collectors.toList());
                
            List<Map<String, Object>> tasks = cases.stream().map(c -> {
                Map<String, Object> task = new java.util.HashMap<>();
                task.put("id", c.getId());
                task.put("caseTitle", c.getTitle());
                task.put("respondent", c.getRespondent());
                task.put("status", "PENDING_DELIVERY");
                task.put("type", "SUMMONS");
                return task;
            }).collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mark summons as served
     */
    @PostMapping("/summons/{caseId}/complete")
    public ResponseEntity<?> completeSummonsTask(@PathVariable UUID caseId, Authentication auth) {
        try {
            com.nyaysetu.backend.entity.CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));
            
            caseEntity.setSummonsStatus("SERVED");
            caseEntity.setStatus(com.nyaysetu.backend.entity.CaseStatus.SUMMONS_SERVED);
            caseRepository.save(caseEntity);
            
            return ResponseEntity.ok(Map.of("message", "Summons marked as SERVED"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Upload FIR document with SHA-256 digital stamping
     */
    @PostMapping(value = "/fir/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FirUploadResponse> uploadFir(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "caseId", required = false) String caseIdStr,
            Authentication auth) {

        User user = getCurrentUser(auth);
        
        UUID caseId = null;
        if (caseIdStr != null && !caseIdStr.isEmpty()) {
            try {
                caseId = UUID.fromString(caseIdStr);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid caseId format: {}", caseIdStr);
            }
        }

        FirUploadRequest request = FirUploadRequest.builder()
                .title(title)
                .description(description)
                .caseId(caseId)
                .build();

        FirUploadResponse response = firService.uploadFir(file, request, user);
        
        log.info("FIR uploaded successfully: {} with hash {}", response.getFirNumber(), response.getFileHash());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all FIRs uploaded by the current officer
     */
    @GetMapping("/fir/list")
    public ResponseEntity<List<FirUploadResponse>> getMyFirs(Authentication auth) {
        User user = getCurrentUser(auth);
        List<FirUploadResponse> firs = firService.getFirsByUploader(user.getId());
        return ResponseEntity.ok(firs);
    }

    /**
     * Get FIR details by ID
     */
    @GetMapping("/fir/{id}")
    public ResponseEntity<FirUploadResponse> getFirById(@PathVariable Long id) {
        FirUploadResponse fir = firService.getFirById(id);
        return ResponseEntity.ok(fir);
    }

    /**
     * Verify FIR integrity by re-hashing uploaded file
     */
    @PostMapping(value = "/fir/{id}/verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FirUploadResponse> verifyFir(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        FirUploadResponse response = firService.verifyFirIntegrity(id, file);
        return ResponseEntity.ok(response);
    }

    /**
     * Get police dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<FirService.FirStatsResponse> getStats(Authentication auth) {
        User user = getCurrentUser(auth);
        FirService.FirStatsResponse stats = firService.getStats(user.getId());
        return ResponseEntity.ok(stats);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "service", "Police FIR Portal",
                "message", "SHA-256 Digital Stamping Active"
        ));
    }

    /**
     * Get all FIRs pending police review (client-filed FIRs)
     */
    @GetMapping("/fir/pending")
    public ResponseEntity<List<FirUploadResponse>> getPendingFirs() {
        List<FirUploadResponse> firs = firService.getPendingReviewFirs();
        return ResponseEntity.ok(firs);
    }

    /**
     * Update FIR status (REGISTERED or REJECTED)
     */
    @PutMapping("/fir/{id}/status")
    public ResponseEntity<FirUploadResponse> updateFirStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "reviewNotes", required = false) String reviewNotes,
            Authentication auth) {
        
        User user = getCurrentUser(auth);
        
        if (!status.equals("REGISTERED") && !status.equals("REJECTED")) {
            return ResponseEntity.badRequest().build();
        }
        
        FirUploadResponse response = firService.updateFirStatus(id, status, reviewNotes, user);
        log.info("FIR {} status updated to {} by {}", response.getFirNumber(), status, user.getName());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Start investigation on an FIR
     */
    @PostMapping("/investigation/{id}/start")
    public ResponseEntity<FirUploadResponse> startInvestigation(
            @PathVariable Long id,
            Authentication auth) {
        
        User user = getCurrentUser(auth);
        FirUploadResponse response = firService.startInvestigation(id, user);
        return ResponseEntity.ok(response);
    }

    /**
     * Submit investigation findings to court
     */
    @PostMapping("/investigation/{id}/submit")
    public ResponseEntity<FirUploadResponse> submitInvestigation(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication auth) {
        
        User user = getCurrentUser(auth);
        String findings = request.get("findings");
        
        if (findings == null || findings.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        FirUploadResponse response = firService.submitToCourt(id, findings, user);
        return ResponseEntity.ok(response);
    }

    /**
     * Get FIRs currently under investigation
     */
    @GetMapping("/investigation/list")
    public ResponseEntity<List<FirUploadResponse>> getFirsUnderInvestigation() {
        List<FirUploadResponse> firs = firService.getFirsUnderInvestigation();
        return ResponseEntity.ok(firs);
    }

    /**
     * Upload additional evidence to FIR
     */
    @PostMapping(value = "/investigation/{id}/evidence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FirUploadResponse> uploadeEvidence(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("description") String description,
            Authentication auth) {
        
        User user = getCurrentUser(auth);
        FirUploadResponse response = firService.addEvidence(id, file, description, user);
        return ResponseEntity.ok(response);
    }

    /**
     * Generate AI Summary using Groq
     */
    @GetMapping("/investigation/{id}/summary")
    public ResponseEntity<Map<String, String>> generateSummary(@PathVariable Long id) {
        String summary = firService.generateSummary(id);
        return ResponseEntity.ok(Map.of("summary", summary));
    }

    /**
     * Draft Court Submission using Groq (Charge Sheet)
     */
    @GetMapping("/investigation/{id}/draft-submission")
    public ResponseEntity<Map<String, String>> draftSubmission(@PathVariable Long id) {
        String draft = firService.draftCourtSubmission(id);
        return ResponseEntity.ok(Map.of("draft", draft));
    }

    private User getCurrentUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}

