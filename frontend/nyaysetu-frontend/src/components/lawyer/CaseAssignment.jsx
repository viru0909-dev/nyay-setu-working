package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.LawyerDTO;
import com.nyaysetu.backend.dto.LawyerMatchDTO;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.CaseAssignmentService;
import com.nyaysetu.backend.service.LawyerMatchingService;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/cases")
@RequiredArgsConstructor
@Slf4j
public class CaseAssignmentController {

    private final CaseAssignmentService caseAssignmentService;
    private final LawyerMatchingService lawyerMatchingService;

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

    @GetMapping("/lawyers/available")
    public ResponseEntity<List<LawyerDTO>> getAvailableLawyers() {
        List<LawyerDTO> lawyers = caseAssignmentService.getAvailableLawyers();
        return ResponseEntity.ok(lawyers);
    }

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
            @RequestBody Map<String, Object> request
    ) {
        try {
            Long judgeId = Long.parseLong(request.get("judgeId").toString());
            caseAssignmentService.takeCognizance(caseId, judgeId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cognizance taken successfully. Case moved to Docket.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to take cognizance for case {}", caseId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{caseId}/update-summons")
    public ResponseEntity<Map<String, Object>> updateSummons(
            @PathVariable UUID caseId,
            @RequestBody Map<String, Boolean> request
    ) {
        try {
            boolean served = request.get("served");
            caseAssignmentService.updateSummonsStatus(caseId, served);
            return ResponseEntity.ok(Map.of("success", true, "message", "Summons status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/{caseId}/document-status")
    public ResponseEntity<Map<String, Object>> updateDocumentStatus(
            @PathVariable UUID caseId,
            @RequestBody Map<String, String> request
    ) {
        try {
            String statusStr = request.get("status");
            com.nyaysetu.backend.entity.DocumentStatus status =
                    com.nyaysetu.backend.entity.DocumentStatus.valueOf(statusStr);
            caseAssignmentService.updateDocumentStatus(caseId, status);
            return ResponseEntity.ok(Map.of("success", true, "message", "Document status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Get top-10 matched lawyers for a case based on expertise tags
     */
    @PostMapping("/{caseId}/match-lawyers")
    public ResponseEntity<List<LawyerMatchDTO>> matchLawyers(
            @PathVariable UUID caseId,
            @RequestBody Map<String, Object> request
    ) {
        try {
            @SuppressWarnings("unchecked")
            List<String> requiredTags = (List<String>) request.get("requiredTags");
            List<LawyerMatchDTO> matches = lawyerMatchingService.getTopMatches(caseId, requiredTags);
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            log.error("Failed to match lawyers for case {}", caseId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get lawyer directory with optional city/expertise filters
     */
    @GetMapping("/lawyers/directory")
    public ResponseEntity<List<LawyerMatchDTO>> getLawyerDirectory(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String expertise
    ) {
        List<LawyerMatchDTO> result = lawyerMatchingService.getDirectory(city, expertise);
        return ResponseEntity.ok(result);
    }
}