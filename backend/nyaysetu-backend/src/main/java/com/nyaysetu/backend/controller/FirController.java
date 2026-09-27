package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.FirUploadRequest;
import com.nyaysetu.backend.dto.FirUploadResponse;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.FirService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "FIR (Police)", description = "Police-facing FIR creation, upload, investigation and case submission")
@RestController
@RequestMapping("/police")
@RequiredArgsConstructor
@Slf4j
public class FirController {

    private final FirService firService;
    private final UserRepository userRepository;
    private final com.nyaysetu.backend.repository.CaseRepository caseRepository;

    @Operation(summary = "Get pending summons delivery tasks", description = "Retrieve pending summons delivery tasks for police officers")
    @GetMapping("/summons/pending")
    public ResponseEntity<?> getSummonsTasks() {
        try {
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

    @Operation(summary = "Mark summons task completed", description = "Mark summons delivery status as SERVED for a case")
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

    @Operation(summary = "Upload FIR document", description = "Upload FIR document with SHA-256 digital stamping")
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

    @Operation(summary = "Get FIRs uploaded by current officer", description = "List all FIRs uploaded by the authenticated police officer")
    @GetMapping("/fir/list")
    public ResponseEntity<List<FirUploadResponse>> getMyFirs(Authentication auth) {
        User user = getCurrentUser(auth);
        List<FirUploadResponse> firs = firService.getFirsByUploader(user.getId());
        return ResponseEntity.ok(firs);
    }

    @Operation(summary = "Get FIR details by ID", description = "Retrieve specific FIR metadata and hash information")
    @GetMapping("/fir/{id}")
    public ResponseEntity<FirUploadResponse> getFirById(@PathVariable Long id) {
        FirUploadResponse fir = firService.getFirById(id);
        return ResponseEntity.ok(fir);
    }

    @Operation(summary = "Verify FIR integrity", description = "Re-hash uploaded file against recorded SHA-256 hash")
    @PostMapping(value = "/fir/{id}/verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FirUploadResponse> verifyFir(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        FirUploadResponse response = firService.verifyFirIntegrity(id, file);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get police dashboard statistics", description = "Summary statistics of FIRs handled by the officer")
    @GetMapping("/stats")
    public ResponseEntity<FirService.FirStatsResponse> getStats(Authentication auth) {
        User user = getCurrentUser(auth);
        FirService.FirStatsResponse stats = firService.getStats(user.getId());
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Health check for Police portal", description = "Health status of FIR service")
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "service", "Police FIR Portal",
                "message", "SHA-256 Digital Stamping Active"
        ));
    }

    @Operation(summary = "Get pending FIRs for review", description = "Retrieve litigant-filed FIRs awaiting police verification")
    @GetMapping("/fir/pending")
    public ResponseEntity<List<FirUploadResponse>> getPendingFirs() {
        List<FirUploadResponse> firs = firService.getPendingReviewFirs();
        return ResponseEntity.ok(firs);
    }

    @Operation(summary = "Update FIR status", description = "Register or reject a pending FIR")
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

    @Operation(summary = "Start investigation on FIR", description = "Change FIR state to under investigation")
    @PostMapping("/investigation/{id}/start")
    public ResponseEntity<FirUploadResponse> startInvestigation(
            @PathVariable Long id,
            Authentication auth) {
        
        User user = getCurrentUser(auth);
        FirUploadResponse response = firService.startInvestigation(id, user);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Submit investigation to court", description = "Submit final investigation findings to court")
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

    @Operation(summary = "Get FIRs under investigation", description = "Retrieve list of FIRs currently investigated")
    @GetMapping("/investigation/list")
    public ResponseEntity<List<FirUploadResponse>> getFirsUnderInvestigation() {
        List<FirUploadResponse> firs = firService.getFirsUnderInvestigation();
        return ResponseEntity.ok(firs);
    }

    @Operation(summary = "Upload investigation evidence", description = "Add evidence document to an FIR under investigation")
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

    @Operation(summary = "Generate AI summary of FIR", description = "Use Groq AI to generate executive summary of FIR")
    @GetMapping("/investigation/{id}/summary")
    public ResponseEntity<Map<String, String>> generateSummary(@PathVariable Long id) {
        String summary = firService.generateSummary(id);
        return ResponseEntity.ok(Map.of("summary", summary));
    }

    @Operation(summary = "Draft court submission (Charge Sheet)", description = "Use Groq AI to draft charge sheet for court")
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

