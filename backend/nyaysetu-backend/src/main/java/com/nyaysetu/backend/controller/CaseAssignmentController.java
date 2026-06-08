package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.LawyerDTO;
import com.nyaysetu.backend.dto.ProposeLawyerRequest;
import com.nyaysetu.backend.dto.RespondLawyerProposalRequest;
import com.nyaysetu.backend.dto.TakeCognizanceRequest;
import com.nyaysetu.backend.dto.UpdateDocumentStatusRequest;
import com.nyaysetu.backend.dto.UpdateSummonsRequest;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.CaseAssignmentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Case Assignment", description = "Assign judges and lawyers to cases automatically or manually")
@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
@Slf4j
public class CaseAssignmentController {

    private final CaseAssignmentService caseAssignmentService;

    @PostMapping("/{caseId}/assign-judge")
    public ResponseEntity<Map<String, Object>> autoAssignJudge(@PathVariable UUID caseId) {
        try {
            User assignedJudge = caseAssignmentService.autoAssignJudge(caseId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Judge assigned successfully");
            response.put("judgeId", assignedJudge.getId());
            response.put("judgeName", assignedJudge.getName());
            response.put("judgeEmail", assignedJudge.getEmail());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to assign judge to case {}", caseId, e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/lawyers/available")
    public ResponseEntity<List<LawyerDTO>> getAvailableLawyers() {
        List<LawyerDTO> lawyers = caseAssignmentService.getAvailableLawyers();
        return ResponseEntity.ok(lawyers);
    }

    @PostMapping("/{caseId}/propose-lawyer")
    public ResponseEntity<Map<String, Object>> proposeLawyer(
            @PathVariable UUID caseId,
            @Valid @RequestBody ProposeLawyerRequest request
    ) {
        try {
            caseAssignmentService.proposeLawyerToCase(caseId, request.getLawyerId());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Proposal sent to lawyer successfully"
            ));
        } catch (Exception e) {
            log.error("Failed to propose lawyer for case {}", caseId, e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/{caseId}/respond-proposal")
    public ResponseEntity<Map<String, Object>> respondProposal(
            @PathVariable UUID caseId,
            @Valid @RequestBody RespondLawyerProposalRequest request
    ) {
        try {
            caseAssignmentService.respondToLawyerProposal(caseId, request.getStatus().name());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Response recorded successfully"
            ));
        } catch (Exception e) {
            log.error("Failed to respond to proposal for case {}", caseId, e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/pending-assignment")
    public ResponseEntity<List<CaseEntity>> getPendingCases() {
        List<CaseEntity> cases = caseAssignmentService.getPendingAssignmentCases();
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/judge-workload")
    public ResponseEntity<List<Map<String, Object>>> getJudgeWorkload() {
        List<Map<String, Object>> workload = caseAssignmentService.getJudgeWorkload();
        return ResponseEntity.ok(workload);
    }

    @PostMapping("/{caseId}/take-cognizance")
    public ResponseEntity<Map<String, Object>> takeCognizance(
            @PathVariable UUID caseId,
            @Valid @RequestBody TakeCognizanceRequest request
    ) {
        try {
            caseAssignmentService.takeCognizance(caseId, request.getJudgeId());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Cognizance taken successfully. Case moved to Docket."
            ));
        } catch (Exception e) {
            log.error("Failed to take cognizance for case {}", caseId, e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/{caseId}/update-summons")
    public ResponseEntity<Map<String, Object>> updateSummons(
            @PathVariable UUID caseId,
            @Valid @RequestBody UpdateSummonsRequest request
    ) {
        try {
            caseAssignmentService.updateSummonsStatus(caseId, request.getServed());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Summons status updated"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/{caseId}/document-status")
    public ResponseEntity<Map<String, Object>> updateDocumentStatus(
            @PathVariable UUID caseId,
            @Valid @RequestBody UpdateDocumentStatusRequest request
    ) {
        try {
            caseAssignmentService.updateDocumentStatus(caseId, request.getStatus());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Document status updated"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}