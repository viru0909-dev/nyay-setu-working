package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.service.CaseStateTransitionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Controller for Case State Transitions (Chain Reaction Handover).
 * Handles role-to-role handoff operations.
 */
@Tag(name = "Case Transitions", description = "Role-to-role handoff — Police to Court, Court to Judge, etc.")
@RestController
@RequestMapping("/cases/transition")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CaseTransitionController {

    private final CaseStateTransitionService transitionService;

    /**
     * POLICE → COURT: Submit case to court for cognizance.
     * Body: { "officerId": "...", "officerName": "..." }
     */
    @PreAuthorize("hasAnyRole('POLICE', 'ADMIN')")
    @PostMapping("/{caseId}/submit-to-court")
    public ResponseEntity<CaseEntity> policeSubmitToCourt(
            @PathVariable UUID caseId,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        String officerId = request.get("officerId");
        String officerName = request.get("officerName");
        
        CaseEntity result = transitionService.policeSubmitToCourt(caseId, officerId, officerName, authentication);
        return ResponseEntity.ok(result);
    }

    /**
     * LAWYER: Save draft petition (triggers client approval workflow).
     * Body: { "lawyerId": "...", "lawyerName": "...", "draftContent": "..." }
     */
    @PreAuthorize("hasAnyRole('LAWYER', 'ADMIN')")
    @PostMapping("/{caseId}/save-draft")
    public ResponseEntity<CaseEntity> lawyerSaveDraft(
            @PathVariable UUID caseId,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        String lawyerId = request.get("lawyerId");
        String lawyerName = request.get("lawyerName");
        String draftContent = request.get("draftContent");
        
        CaseEntity result = transitionService.lawyerSaveDraft(caseId, lawyerId, lawyerName, draftContent, authentication);
        return ResponseEntity.ok(result);
    }

    /**
     * LITIGANT: Approve draft petition (enables court submission).
     * Body: { "litigantId": "...", "litigantName": "..." }
     */
    @PreAuthorize("hasAnyRole('LITIGANT', 'ADMIN')")
    @PostMapping("/{caseId}/approve-draft")
    public ResponseEntity<CaseEntity> litigantApproveDraft(
            @PathVariable UUID caseId,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        String litigantId = request.get("litigantId");
        String litigantName = request.get("litigantName");
        
        CaseEntity result = transitionService.litigantApproveDraft(caseId, litigantId, litigantName, authentication);
        return ResponseEntity.ok(result);
    }

    /**
     * LITIGANT: Reject draft petition.
     * Body: { "litigantId": "...", "litigantName": "...", "reason": "..." }
     */
    @PreAuthorize("hasAnyRole('LITIGANT', 'ADMIN')")
    @PostMapping("/{caseId}/reject-draft")
    public ResponseEntity<CaseEntity> litigantRejectDraft(
            @PathVariable UUID caseId,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        String litigantId = request.get("litigantId");
        String litigantName = request.get("litigantName");
        String reason = request.get("reason");
        
        CaseEntity result = transitionService.litigantRejectDraft(caseId, litigantId, litigantName, reason, authentication);
        return ResponseEntity.ok(result);
    }

    /**
     * JUDGE: Take cognizance of case.
     * Body: { "judgeId": 123, "judgeName": "..." }
     */
    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping("/{caseId}/take-cognizance")
    public ResponseEntity<CaseEntity> judgeTakeCognizance(
            @PathVariable UUID caseId,
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        Long judgeId = Long.valueOf(request.get("judgeId").toString());
        String judgeName = (String) request.get("judgeName");
        
        CaseEntity result = transitionService.judgeTakeCognizance(caseId, judgeId, judgeName, authentication);
        return ResponseEntity.ok(result);
    }

    /**
     * JUDGE: Advance case to next stage in the 7-step process.
     * Body: { "judgeId": 123, "judgeName": "..." }
     */
    @PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping("/{caseId}/advance-stage")
    public ResponseEntity<CaseEntity> judgeAdvanceStage(
            @PathVariable UUID caseId,
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        Long judgeId = Long.valueOf(request.get("judgeId").toString());
        String judgeName = (String) request.get("judgeName");
        
        CaseEntity result = transitionService.judgeAdvanceStage(caseId, judgeId, judgeName, authentication);
        return ResponseEntity.ok(result);
    }

    /**
     * SYSTEM: Mark summons as served.
     */
    @PreAuthorize("hasAnyRole('POLICE', 'JUDGE', 'SUPER_JUDGE', 'ADMIN')")
    @PostMapping("/{caseId}/summons-served")
    public ResponseEntity<CaseEntity> markSummonsServed(
            @PathVariable UUID caseId,
            Authentication authentication
    ) {
        CaseEntity result = transitionService.markSummonsServed(caseId, authentication);
        return ResponseEntity.ok(result);
    }

    /**
     * Get case health status (trial readiness check).
     */
    @GetMapping("/{caseId}/health")
    public ResponseEntity<Map<String, Object>> getCaseHealth(
            @PathVariable UUID caseId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "message", "Use full case endpoint for complete health info"
        ));
    }
}
