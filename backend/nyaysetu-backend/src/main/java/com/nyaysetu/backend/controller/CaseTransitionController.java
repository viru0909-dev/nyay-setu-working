package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.transition.*;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.service.CaseStateTransitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for Case State Transitions (Chain Reaction Handover).
 * Handles role-to-role handoff operations with validated DTOs.
 */
@Tag(name = "Case Transitions", description = "Role-to-role handoff — Police to Court, Court to Judge, etc.")
@RestController
@RequestMapping("/cases/transition")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CaseTransitionController {

    private final CaseStateTransitionService transitionService;

    @Operation(summary = "POLICE → COURT: Submit case to court for cognizance")
    @PostMapping("/{caseId}/submit-to-court")
    public ResponseEntity<CaseEntity> policeSubmitToCourt(
            @PathVariable UUID caseId,
            @Valid @RequestBody PoliceHandoffRequest request
    ) {
        CaseEntity result = transitionService.policeSubmitToCourt(
            caseId, 
            request.getOfficerId(), 
            request.getOfficerName()
        );
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "LAWYER: Save draft petition (triggers client approval workflow)")
    @PostMapping("/{caseId}/save-draft")
    public ResponseEntity<CaseEntity> lawyerSaveDraft(
            @PathVariable UUID caseId,
            @Valid @RequestBody LawyerDraftRequest request
    ) {
        CaseEntity result = transitionService.lawyerSaveDraft(
            caseId, 
            request.getLawyerId(), 
            request.getLawyerName(), 
            request.getDraftContent()
        );
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "LITIGANT: Approve draft petition (enables court submission)")
    @PostMapping("/{caseId}/approve-draft")
    public ResponseEntity<CaseEntity> litigantApproveDraft(
            @PathVariable UUID caseId,
            @Valid @RequestBody LitigantResponseRequest request
    ) {
        CaseEntity result = transitionService.litigantApproveDraft(
            caseId, 
            request.getLitigantId(), 
            request.getLitigantName()
        );
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "LITIGANT: Reject draft petition")
    @PostMapping("/{caseId}/reject-draft")
    public ResponseEntity<CaseEntity> litigantRejectDraft(
            @PathVariable UUID caseId,
            @Valid @RequestBody LitigantResponseRequest request
    ) {
        CaseEntity result = transitionService.litigantRejectDraft(
            caseId, 
            request.getLitigantId(), 
            request.getLitigantName(), 
            request.getReason()
        );
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "JUDGE: Take cognizance of case")
    @PostMapping("/{caseId}/take-cognizance")
    public ResponseEntity<CaseEntity> judgeTakeCognizance(
            @PathVariable UUID caseId,
            @Valid @RequestBody JudgeReviewRequest request
    ) {
        CaseEntity result = transitionService.judgeTakeCognizance(
            caseId, 
            request.getJudgeId(), 
            request.getJudgeName()
        );
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "JUDGE: Advance case stage")
    @PostMapping("/{caseId}/advance-stage")
    public ResponseEntity<CaseEntity> judgeAdvanceStage(
            @PathVariable UUID caseId,
            @Valid @RequestBody JudgeReviewRequest request
    ) {
        CaseEntity result = transitionService.judgeAdvanceStage(
            caseId, 
            request.getJudgeId(), 
            request.getJudgeName()
        );
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "POLICE: Mark summons as served")
    @PostMapping("/{caseId}/summons-served")
    public ResponseEntity<CaseEntity> markSummonsServed(
            @PathVariable UUID caseId,
            @Valid @RequestBody SummonsServedRequest request
    ) {
        CaseEntity result = transitionService.markSummonsServed(caseId);
        return ResponseEntity.ok(result);
    }
}
