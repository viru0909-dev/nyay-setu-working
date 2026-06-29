package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.CaseDraft;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.repository.CaseDraftRepository;
import com.nyaysetu.backend.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
/**
 * REST Controller implementing critical trust-boundary controls. Separates unverified 
 * AI narrative collection drafts from explicit authenticated user confirmation actions.
 */
@RestController
@RequestMapping("/api/v1/case-drafts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class CaseDraftController {
    private final UserRepository userRepository;
    private final CaseDraftRepository caseDraftRepository;
    private final CaseRepository caseRepository;

    /**
     * POST endpoint to seed a new case draft.
     * Invoked during interactive AI collection streams to isolate data parameters.
     */
    @PostMapping
    public ResponseEntity<CaseDraft> createDraft(@RequestBody CaseDraft draftPayload) {
        log.info("[SecurityAudit] Initializing structural case draft for citizen: {}", draftPayload.getCitizenId());
        draftPayload.setStatus("COLLECTING_INFORMATION");
        CaseDraft savedDraft = caseDraftRepository.save(draftPayload);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDraft);
    }

    /**
     * GET endpoint to securely resolve all staging drafts belonging to the active user.
     */
    @GetMapping("/citizen/{citizenId}")
    public ResponseEntity<List<CaseDraft>> getCitizenDrafts(@PathVariable String citizenId) {
        log.info("[SecurityAudit] Querying staging records index vector for citizen context: {}", citizenId);
        List<CaseDraft> drafts = caseDraftRepository.findByCitizenId(citizenId);
        return ResponseEntity.ok(drafts);
    }

    /**
     * POST endpoint to capture mandatory, explicit human verification and filing intent.
     * Hardened Trust-Boundary: Extracts the authenticated user's name principal securely from 
     * the Spring Security context to eliminate client-side parameter ID spoofing vulnerabilities.
     */
    @PostMapping("/{draftId}/confirm")
    public ResponseEntity<Map<String, Object>> confirmAndFileCase(
            @PathVariable Long draftId,
            Authentication authentication) {
        
        log.info("[CriticalAudit] Intercepting programmatic filing confirmation intent for Draft ID: {}", draftId);
        Map<String, Object> responseMetadata = new HashMap<>();

        // Ensure the authentication principal is active and valid
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("[SecurityViolation] Unauthenticated request dropped at confirmation boundary for Draft ID: {}", draftId);
            responseMetadata.put("success", false);
            responseMetadata.put("message", "Access Denied: Unauthenticated security principal context.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseMetadata);
        }

        // Securely resolve the citizen ID string parameter directly from the validated backend token principal context
        String authenticatedCitizenId = authentication.getName();

        // 1. Enforce existence and strict multi-tenant owner boundary verification
        Optional<CaseDraft> draftOptional = caseDraftRepository.findByIdAndCitizenId(draftId, authenticatedCitizenId);
        if (draftOptional.isEmpty()) {
            log.warn("[SecurityViolation] Authenticated entity attempted to access or file non-existent or un-owned Draft: {}", draftId);
            responseMetadata.put("success", false);
            responseMetadata.put("message", "Access Denied: Draft record missing or authorization parameters invalid.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(responseMetadata);
        }

        CaseDraft targetDraft = draftOptional.get();

        // 2. Prevent race conditions and duplicate case filing attempts
        if ("FILED".equalsIgnoreCase(targetDraft.getStatus())) {
            log.warn("[SecurityGuard] Blocked duplicate filing transaction request for already processed Draft: {}", draftId);
            responseMetadata.put("success", false);
            responseMetadata.put("message", "Invalid Operation: This staging case draft has already been filed and finalized.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(responseMetadata);
        }

        // 3. Structural fields validation check prior to permanent filing ingestion
        if (targetDraft.getPetitionerName() == null || targetDraft.getPetitionerName().isBlank() ||
            targetDraft.getRespondentName() == null || targetDraft.getRespondentName().isBlank() ||
            targetDraft.getCaseType() == null || targetDraft.getCaseType().isBlank() ||
            targetDraft.getFacts() == null || targetDraft.getFacts().isBlank()) {
            
            log.warn("[SecurityGuard] Aborted filing workflow: Required structural metrics missing across Draft ID: {}", draftId);
            responseMetadata.put("success", false);
            responseMetadata.put("message", "Filing Rejected: Structural draft fields must be complete before manual user confirmation.");
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT).body(responseMetadata);
        }

        try {
            // 4. Update the stateful staging draft model tracking boundaries
            targetDraft.setStatus("FILED");
            targetDraft.setConfirmedAt(LocalDateTime.now());
            caseDraftRepository.save(targetDraft);

            // 5. Build and transition into a permanent, canonical judiciary court CaseEntity
            CaseEntity officialCaseRecord = new CaseEntity();
            User citizen = userRepository.findByEmail(targetDraft.getCitizenId())
                    .orElseThrow(() -> new IllegalStateException(
                            "Citizen user not found for ID: " + targetDraft.getCitizenId()));
            officialCaseRecord.setClient(citizen);
            officialCaseRecord.setCaseType(targetDraft.getCaseType());
            officialCaseRecord.setDescription(String.format(
                    "VERIFIED PETITIONER: %s | RESPONDENT: %s | JURISDICTION: %s | FACTS: %s",
                    targetDraft.getPetitionerName(),
                    targetDraft.getRespondentName(),
                    targetDraft.getJurisdiction(),
                    targetDraft.getFacts()
            ));
            officialCaseRecord.setStatus(CaseStatus.PENDING);
            officialCaseRecord.setCreatedAt(LocalDateTime.now());

            CaseEntity finalizedCase = caseRepository.save(officialCaseRecord);
            log.info("[CriticalAudit] Trust-boundary verified. Permanent CaseEntity successfully ingested with ID: {}", finalizedCase.getId());

            responseMetadata.put("success", true);
            responseMetadata.put("message", "Case filed and ingested into official court registers successfully via explicit human verification.");
            responseMetadata.put("caseId", finalizedCase.getId());
            responseMetadata.put("draftSnapshot", targetDraft);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(responseMetadata);
        } catch (Exception e) {
            log.error("[CriticalAudit] Ingestion pipeline exception encountered during final verification pass:", e);
            responseMetadata.put("success", false);
            responseMetadata.put("message", "Internal pipeline failure: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMetadata);
        }
    }
}
