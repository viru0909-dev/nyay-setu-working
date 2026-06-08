package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.JudgeTransitionRequest;
import com.nyaysetu.backend.dto.LawyerSaveDraftRequest;
import com.nyaysetu.backend.dto.LitigantApproveDraftRequest;
import com.nyaysetu.backend.dto.LitigantRejectDraftRequest;
import com.nyaysetu.backend.dto.PoliceSubmitToCourtRequest;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.service.CaseStateTransitionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Tag(name = "Case Transitions", description = "Role-to-role handoff operations")
@RestController
@RequestMapping("/api/cases/transition")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CaseTransitionController {

    private final CaseStateTransitionService transitionService;

    @PostMapping("/{caseId}/submit-to-court")
    public ResponseEntity<CaseEntity> policeSubmitToCourt(
            @PathVariable UUID caseId,
            @Valid @RequestBody PoliceSubmitToCourtRequest request
    ) {
        CaseEntity result = transitionService.policeSubmitToCourt(
                caseId,
                request.getOfficerId(),
                request.getOfficerName()
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{caseId}/save-draft")
    public ResponseEntity<CaseEntity> lawyerSaveDraft(
            @PathVariable UUID caseId,
            @Valid @RequestBody LawyerSaveDraftRequest request
    ) {
        CaseEntity result = transitionService.lawyerSaveDraft(
                caseId,
                request.getLawyerId(),
                request.getLawyerName(),
                request.getDraftContent()
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{caseId}/approve-draft")
    public ResponseEntity<CaseEntity> litigantApproveDraft(
            @PathVariable UUID caseId,
            @Valid @RequestBody LitigantApproveDraftRequest request
    ) {
        CaseEntity result = transitionService.litigantApproveDraft(
                caseId,
                request.getLitigantId(),
                request.getLitigantName()
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{caseId}/reject-draft")
    public ResponseEntity<CaseEntity> litigantRejectDraft(
            @PathVariable UUID caseId,
            @Valid @RequestBody LitigantRejectDraftRequest request
    ) {
        CaseEntity result = transitionService.litigantRejectDraft(
                caseId,
                request.getLitigantId(),
                request.getLitigantName(),
                request.getReason()
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{caseId}/take-cognizance")
    public ResponseEntity<CaseEntity> judgeTakeCognizance(
            @PathVariable UUID caseId,
            @Valid @RequestBody JudgeTransitionRequest request
    ) {
        CaseEntity result = transitionService.judgeTakeCognizance(
                caseId,
                request.getJudgeId(),
                request.getJudgeName()
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{caseId}/advance-stage")
    public ResponseEntity<CaseEntity> judgeAdvanceStage(
            @PathVariable UUID caseId,
            @Valid @RequestBody JudgeTransitionRequest request
    ) {
        CaseEntity result = transitionService.judgeAdvanceStage(
                caseId,
                request.getJudgeId(),
                request.getJudgeName()
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{caseId}/summons-served")
    public ResponseEntity<CaseEntity> markSummonsServed(@PathVariable UUID caseId) {
        CaseEntity result = transitionService.markSummonsServed(caseId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{caseId}/health")
    public ResponseEntity<Map<String, Object>> getCaseHealth(@PathVariable UUID caseId) {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "message", "Use full case endpoint for complete health info"
        ));
    }
}