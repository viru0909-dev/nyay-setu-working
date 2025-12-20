package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.LawyerDTO;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.CaseAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for case assignment operations
 */
@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
@Slf4j
public class CaseAssignmentController {

    private final CaseAssignmentService caseAssignmentService;

    /**
     * Auto-assign a judge to a case
     */
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
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get list of available lawyers for client selection
     */
    @GetMapping("/lawyers/available")
    public ResponseEntity<List<LawyerDTO>> getAvailableLawyers() {
        List<LawyerDTO> lawyers = caseAssignmentService.getAvailableLawyers();
        return ResponseEntity.ok(lawyers);
    }

    /**
     * Propose a lawyer for a case
     */
    @PostMapping("/{caseId}/propose-lawyer")
    public ResponseEntity<Map<String, Object>> proposeLawyer(
            @PathVariable UUID caseId,
            @RequestBody Map<String, Object> request
    ) {
        try {
            Long lawyerId = Long.parseLong(request.get("lawyerId").toString());
            caseAssignmentService.proposeLawyerToCase(caseId, lawyerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Proposal sent to lawyer successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to propose lawyer for case {}", caseId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Respond to a lawyer proposal
     */
    @PostMapping("/{caseId}/respond-proposal")
    public ResponseEntity<Map<String, Object>> respondProposal(
            @PathVariable UUID caseId,
            @RequestBody Map<String, Object> request
    ) {
        try {
            String status = request.get("status").toString();
            caseAssignmentService.respondToLawyerProposal(caseId, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Response recorded successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to respond to proposal for case {}", caseId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get cases pending judge assignment (for admin)
     */
    @GetMapping("/pending-assignment")
    public ResponseEntity<List<CaseEntity>> getPendingCases() {
        List<CaseEntity> cases = caseAssignmentService.getPendingAssignmentCases();
        return ResponseEntity.ok(cases);
    }

    /**
     * Get judge workload (for admin dashboard)
     */
    @GetMapping("/judge-workload")
    public ResponseEntity<List<Map<String, Object>>> getJudgeWorkload() {
        List<Map<String, Object>> workload = caseAssignmentService.getJudgeWorkload();
        return ResponseEntity.ok(workload);
    }
}
