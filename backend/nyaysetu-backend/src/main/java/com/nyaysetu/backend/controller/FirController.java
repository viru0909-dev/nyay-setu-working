package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.FirUploadRequest;
import com.nyaysetu.backend.dto.FirUploadResponse;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.FirService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "FIR (Police)", description = "Police-facing FIR creation, upload and case submission")
@RestController
@RequestMapping("/api/police")
@RequiredArgsConstructor
@Slf4j
// SECURITY FIX (P0 — Finding 6): The entire /api/police/** path is already
// restricted to POLICE/ADMIN by SecurityConfig. The @PreAuthorize annotations
// here provide defence-in-depth at the method level and make intent explicit.
@PreAuthorize("hasAnyRole('POLICE', 'ADMIN')")
public class FirController {

    private final FirService firService;
    private final UserRepository userRepository;
    private final com.nyaysetu.backend.repository.CaseRepository caseRepository;

    /**
     * Get pending summons delivery tasks for police.
     * SECURITY FIX (P0 — Finding 6b): Replaced caseRepository.findAll() full-table
     * scan (OOM DoS vector) with a targeted query by summons status.
     */
    @GetMapping("/summons/pending")
    public ResponseEntity<?> getSummonsTasks() {
        try {
            // FIX: Use a targeted query instead of findAll() + in-memory filter
            List<com.nyaysetu.backend.entity.CaseEntity> cases =
                caseRepository.findBySummonsStatus("IN_TRANSIT");

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
            log.error("Error fetching summons tasks", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to retrieve summons tasks"));
        }
    }

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
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to complete summons task"));
        }
    }

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
            try { caseId = UUID.fromString(caseIdStr); } catch (IllegalArgumentException e) {
                log.warn("Invalid caseId format: {}", caseIdStr);
            }
        }
        FirUploadRequest request = FirUploadRequest.builder()
            .title(title).description(description).caseId(caseId).build();
        FirUploadResponse response = firService.uploadFir(file, request, user);
        log.info("FIR uploaded by {}: {} hash={}", user.getEmail(), response.getFirNumber(), response.getFileHash());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/fir/list")
    public ResponseEntity<List<FirUploadResponse>> getMyFirs(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(firService.getFirsByUploader(user.getId()));
    }

    @GetMapping("/fir/{id}")
    public ResponseEntity<FirUploadResponse> getFirById(@PathVariable Long id) {
        return ResponseEntity.ok(firService.getFirById(id));
    }

    @PostMapping(value = "/fir/{id}/verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FirUploadResponse> verifyFir(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(firService.verifyFirIntegrity(id, file));
    }

    @GetMapping("/stats")
    public ResponseEntity<FirService.FirStatsResponse> getStats(Authentication auth) {
        return ResponseEntity.ok(firService.getStats(getCurrentUser(auth).getId()));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "OK", "service", "Police FIR Portal",
            "message", "SHA-256 Digital Stamping Active"));
    }

    /**
     * SECURITY FIX (P0 — Finding 6): getPendingFirs had no role check and
     * was accessible to any authenticated user including litigants — allowing
     * a suspect to view and potentially manipulate their own FIR status.
     * Now enforced by class-level @PreAuthorize("hasAnyRole('POLICE','ADMIN')").
     */
    @GetMapping("/fir/pending")
    public ResponseEntity<List<FirUploadResponse>> getPendingFirs() {
        return ResponseEntity.ok(firService.getPendingReviewFirs());
    }

    /**
     * SECURITY FIX (P0 — Finding 6): FIR status update (REGISTERED/REJECTED)
     * was accessible to any authenticated user. A litigant could approve or
     * reject their own FIR. Now restricted to POLICE/ADMIN at class level.
     */
    @PutMapping("/fir/{id}/status")
    public ResponseEntity<FirUploadResponse> updateFirStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "reviewNotes", required = false) String reviewNotes,
            Authentication auth) {

        if (!status.equals("REGISTERED") && !status.equals("REJECTED")) {
            return ResponseEntity.badRequest().build();
        }
        User user = getCurrentUser(auth);
        FirUploadResponse response = firService.updateFirStatus(id, status, reviewNotes, user);
        log.info("FIR {} updated to {} by officer {}", response.getFirNumber(), status, user.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/investigation/{id}/start")
    public ResponseEntity<FirUploadResponse> startInvestigation(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(firService.startInvestigation(id, getCurrentUser(auth)));
    }

    @PostMapping("/investigation/{id}/submit")
    public ResponseEntity<FirUploadResponse> submitInvestigation(
            @PathVariable Long id, @RequestBody Map<String, String> request, Authentication auth) {
        String findings = request.get("findings");
        if (findings == null || findings.trim().isEmpty()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(firService.submitToCourt(id, findings, getCurrentUser(auth)));
    }

    @GetMapping("/investigation/list")
    public ResponseEntity<List<FirUploadResponse>> getFirsUnderInvestigation() {
        return ResponseEntity.ok(firService.getFirsUnderInvestigation());
    }

    @PostMapping(value = "/investigation/{id}/evidence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FirUploadResponse> uploadEvidence(
            @PathVariable Long id, @RequestParam("file") MultipartFile file,
            @RequestParam("description") String description, Authentication auth) {
        return ResponseEntity.ok(firService.addEvidence(id, file, description, getCurrentUser(auth)));
    }

    @GetMapping("/investigation/{id}/summary")
    public ResponseEntity<Map<String, String>> generateSummary(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("summary", firService.generateSummary(id)));
    }

    @GetMapping("/investigation/{id}/draft-submission")
    public ResponseEntity<Map<String, String>> draftSubmission(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("draft", firService.draftCourtSubmission(id)));
    }

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }
}
