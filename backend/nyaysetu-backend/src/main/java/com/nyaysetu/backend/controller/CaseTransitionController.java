package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.service.CaseStateTransitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Controller for Case State Transitions (Chain Reaction Handover).
 * Handles role-to-role handoff operations.
 */
@RestController
@RequestMapping("/api/cases/transition")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CaseTransitionController {

    private final CaseStateTransitionService transitionService;

    /**
     * POLICE → COURT: Submit case to court for cognizance.
     * Body: { "officerId": "...", "officerName": "..." }
     */
    @PostMapping("/{caseId}/submit-to-court")
    public ResponseEntity<CaseEntity> policeSubmitToCourt(
            @PathVariable UUID caseId,
            @RequestBody Map<String, String> request
    ) {
        String officerId = request.get("officerId");
        String officerName = request.get("officerName");
        
        CaseEntity result = transitionService.policeSubmitToCourt(caseId, officerId, officerName);
        return ResponseEntity.ok(result);
    }

    /**
     * LAWYER: Save draft petition (triggers client approval workflow).
     * Body: { "lawyerId": "...", "lawyerName": "...", "draftContent": "..." }
     */
    @PostMapping("/{caseId}/save-draft")
    public ResponseEntity<CaseEntity> lawyerSaveDraft(
            @PathVariable UUID caseId,
            @RequestBody Map<String, String> request
    ) {
        String lawyerId = request.get("lawyerId");
        String lawyerName = request.get("lawyerName");
        String draftContent = request.get("draftContent");
        
        CaseEntity result = transitionService.lawyerSaveDraft(caseId, lawyerId, lawyerName, draftContent);
        return ResponseEntity.ok(result);
    }

    /**
     * LITIGANT: Approve draft petition (enables court submission).
     * Body: { "litigantId": "...", "litigantName": "..." }
     */
    @PostMapping("/{caseId}/approve-draft")
    public ResponseEntity<CaseEntity> litigantApproveDraft(
            @PathVariable UUID caseId,
            @RequestBody Map<String, String> request
    ) {
        String litigantId = request.get("litigantId");
        String litigantName = request.get("litigantName");
        
        CaseEntity result = transitionService.litigantApproveDraft(caseId, litigantId, litigantName);
        return ResponseEntity.ok(result);
    }

    /**
     * LITIGANT: Reject draft petition.
     * Body: { "litigantId": "...", "litigantName": "...", "reason": "..." }
     */
    @PostMapping("/{caseId}/reject-draft")
    public ResponseEntity<CaseEntity> litigantRejectDraft(
            @PathVariable UUID caseId,
            @RequestBody Map<String, String> request
    ) {
        String litigantId = request.get("litigantId");
        String litigantName = request.get("litigantName");
        String reason = request.get("reason");
        
        CaseEntity result = transitionService.litigantRejectDraft(caseId, litigantId, litigantName, reason);
        return ResponseEntity.ok(result);
    }

    /**
     * JUDGE: Take cognizance of case.
     * Body: { "judgeId": 123, "judgeName": "..." }
     */
    @PostMapping("/{caseId}/take-cognizance")
    public ResponseEntity<CaseEntity> judgeTakeCognizance(
            @PathVariable UUID caseId,
            @RequestBody Map<String, Object> request
    ) {
        Long judgeId = Long.valueOf(request.get("judgeId").toString());
        String judgeName = (String) request.get("judgeName");
        
        CaseEntity result = transitionService.judgeTakeCognizance(caseId, judgeId, judgeName);
        return ResponseEntity.ok(result);
    }

    /**
     * JUDGE: Advance case to next stage in the 7-step process.
     * Body: { "judgeId": 123, "judgeName": "..." }
     */
    @PostMapping("/{caseId}/advance-stage")
    public ResponseEntity<CaseEntity> judgeAdvanceStage(
            @PathVariable UUID caseId,
            @RequestBody Map<String, Object> request
    ) {
        Long judgeId = Long.valueOf(request.get("judgeId").toString());
        String judgeName = (String) request.get("judgeName");
        
        CaseEntity result = transitionService.judgeAdvanceStage(caseId, judgeId, judgeName);
        return ResponseEntity.ok(result);
    }

    /**
     * SYSTEM: Mark summons as served.
     */
    @PostMapping("/{caseId}/summons-served")
    public ResponseEntity<CaseEntity> markSummonsServed(@PathVariable UUID caseId) {
        CaseEntity result = transitionService.markSummonsServed(caseId);
        return ResponseEntity.ok(result);
    }

    /**
     * Get case health status (trial readiness check).
     */
    @GetMapping("/{caseId}/health")
    public ResponseEntity<Map<String, Object>> getCaseHealth(@PathVariable UUID caseId) {
        // This would need the case repo; simplified for now
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "message", "Use full case endpoint for complete health info"
        ));
    }
}
