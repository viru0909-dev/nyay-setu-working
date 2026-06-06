package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CaseDTO;
import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.CaseManagementService;
import com.nyaysetu.backend.service.CaseStateTransitionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Case Management", description = "Create, update, retrieve and manage legal cases")
@RestController
@RequestMapping("/cases")
@RequiredArgsConstructor
@Slf4j
public class CaseManagementController {

    private final CaseManagementService caseManagementService;
    private final CaseStateTransitionService caseStateTransitionService;
    private final com.nyaysetu.backend.service.AuthService authService;

    @PostMapping
    public ResponseEntity<CaseDTO> createCase(
            @Valid @RequestBody CreateCaseRequest request,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        CaseDTO caseDTO = caseManagementService.createCase(request, user);
        return ResponseEntity.ok(caseDTO);
    }

    @GetMapping
    public ResponseEntity<List<CaseDTO>> getMyCases(Authentication authentication) {
        try {
            log.info("Getting cases for user: {}", authentication.getName());
            User user = authService.findByEmail(authentication.getName());
            List<CaseDTO> cases = caseManagementService.getCasesByUser(user);
            log.info("Found {} cases for user {}", cases.size(), authentication.getName());
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            log.error("Error fetching cases for user {}: {}", authentication.getName(), e.getMessage());
            return ResponseEntity.ok(Collections.emptyList()); // Return empty list instead of error
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseDTO> getCaseById(@PathVariable UUID id) {
        CaseDTO caseDTO = caseManagementService.getCaseById(id);
        return ResponseEntity.ok(caseDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CaseDTO> updateCase(
            @PathVariable UUID id,
            @Valid @RequestBody CaseDTO caseDTO
    ) {
        CaseDTO updated = caseManagementService.updateCase(id, caseDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCase(@PathVariable UUID id) {
        caseManagementService.deleteCase(id);
        return ResponseEntity.ok(Map.of("message", "Case deleted successfully"));
    }

    /**
     * Handover C: Lawyer submits draft
     */
    @PostMapping("/{id}/submit-draft")
    public ResponseEntity<Map<String, Object>> submitDraft(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request
    ) {
        String draftContent = request.get("draftContent");
        caseManagementService.sendDraftForApproval(id, draftContent);
        return ResponseEntity.ok(Map.of("success", true, "message", "Draft submitted for approval"));
    }

    /**
     * Handover C: Client reviews draft
     */
    @PostMapping("/{id}/review-draft")
    public ResponseEntity<Map<String, Object>> reviewDraft(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request
    ) {
        boolean approved = Boolean.parseBoolean(request.get("approved").toString());
        String comments = request.get("comments") != null ? request.get("comments").toString() : "";
        
        caseManagementService.approveDraft(id, approved, comments);
        
        return ResponseEntity.ok(Map.of(
            "success", true, 
            "message", approved ? "Draft Approved" : "Changes Requested"
        ));
    }

    @PutMapping("/{id}/approve-draft")
    public ResponseEntity<Map<String, Object>> approveDraft(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request
    ) {
        boolean approved = Boolean.parseBoolean(request.get("approved").toString());
        String comments = request.get("comments") != null ? request.get("comments").toString() : "";
        
        caseManagementService.approveDraft(id, approved, comments);
        
        return ResponseEntity.ok(Map.of(
            "success", true, 
            "message", approved ? "Draft Approved" : "Changes Requested"
        ));
    }

    /**
     * Handover D: Lawyer files the approved petition in court
     * Routes through CaseStateTransitionService for audit trail and validation.
     */
    @PostMapping("/{id}/file-in-court")
    public ResponseEntity<Map<String, Object>> fileInCourt(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        User user = authService.findByEmail(authentication.getName());
        CaseEntity result = caseStateTransitionService.lawyerFileInCourt(
            id, user.getId().toString(), user.getName()
        );
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Case filed in court successfully",
            "newStatus", result.getStatus().name()
        ));
    }

    @PostMapping("/{id}/order-notice")
    public ResponseEntity<Map<String, Object>> orderNotice(@PathVariable UUID id) {
        caseManagementService.orderRespondentNotice(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Notice ordered successfully"
        ));
    }

    @PostMapping("/{id}/start-hearings")
    public ResponseEntity<Map<String, Object>> startHearings(@PathVariable UUID id) {
        caseManagementService.startHearings(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Hearings started successfully",
            "newStatus", "IN_PROGRESS"
        ));
    }

    @PostMapping("/{id}/start-evidence")
    public ResponseEntity<Map<String, Object>> startEvidence(@PathVariable UUID id) {
        caseManagementService.startEvidence(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Evidence phase started successfully"
        ));
    }

    @PostMapping("/{id}/start-arguments")
    public ResponseEntity<Map<String, Object>> startArguments(@PathVariable UUID id) {
        caseManagementService.startArguments(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Arguments phase started successfully"
        ));
    }

    @PostMapping("/{id}/start-judgment")
    public ResponseEntity<Map<String, Object>> startJudgment(@PathVariable UUID id) {
        caseManagementService.startJudgment(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Judgment phase started successfully"
        ));
    }

    @PostMapping("/{id}/deliver-verdict")
    public ResponseEntity<Map<String, Object>> deliverVerdict(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        String verdictDetails = payload.getOrDefault("verdictDetails", "Final judgment passed.");
        caseManagementService.deliverVerdict(id, verdictDetails);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Verdict delivered successfully",
            "newStatus", "COMPLETED"
        ));
    }

    @PostMapping("/{id}/parties")
    public ResponseEntity<Map<String, Object>> addParty(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request
    ) {
        String partyName = request.get("partyName");
        String partyType = request.get("partyType"); // PETITIONER, RESPONDENT, WITNESS, etc.
        String partyEmail = request.get("partyEmail");
        
        caseManagementService.addPartyToCase(id, partyName, partyType, partyEmail);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Party added successfully"
        ));
    }

    @PutMapping("/{id}/respondent-details")
    public ResponseEntity<Map<String, Object>> updateRespondentDetails(
            @PathVariable UUID id,
            @Valid @RequestBody com.nyaysetu.backend.dto.RespondentDetailsDTO details
    ) {
        caseManagementService.updateRespondentDetails(id, details);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Respondent details updated successfully"
        ));
    }
}
