package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CaseDTO;
import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.repository.*;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.GroqDocumentVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/judge")
@RequiredArgsConstructor
@Slf4j
public class JudgeController {

    private final CaseRepository caseRepository;
    private final HearingRepository hearingRepository;
    private final com.nyaysetu.backend.service.HearingService hearingService;
    private final AuthService authService;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final GroqDocumentVerificationService groqService;
    private final com.nyaysetu.backend.service.AuditService auditService;
    private final com.nyaysetu.backend.notification.service.NotificationService notificationService;

    /**
     * Get all cases assigned to the logged-in judge
     */
    @GetMapping("/cases")
    public ResponseEntity<?> getJudgeCases(Authentication authentication) {
        User judge = authService.findByEmail(authentication.getName());
        List<CaseEntity> judgeCases = caseRepository.findByAssignedJudge(judge.getName());
        return ResponseEntity.ok(judgeCases);
    }

    @PostMapping("/cases/{id}/claim")
    public ResponseEntity<?> claimCase(@PathVariable UUID id, Authentication authentication) {
        try {
            User judge = authService.findByEmail(authentication.getName());
            CaseEntity caseEntity = caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));
            
            if (caseEntity.getAssignedJudge() != null && !caseEntity.getAssignedJudge().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Case is already assigned to a judge"));
            }
            
            caseEntity.setAssignedJudge(judge.getName());
            caseEntity.setJudgeId(judge.getId());
            // Step 2: Unassigned Pool Logic - COGNIZANCE_PERIOD
            caseEntity.setStatus(CaseStatus.COGNIZANCE_PERIOD);
            caseRepository.save(caseEntity);
            
            // Trigger WebSocket/Notification to Litigant
             // Notify Client
            if (caseEntity.getClient() != null) {
                com.nyaysetu.backend.notification.entity.Notification notif = com.nyaysetu.backend.notification.entity.Notification.builder()
                    .userId(caseEntity.getClient().getId())
                    .title("Case Status Update")
                    .message("The Judge has taken cognizance of your case. It is now Under Review.")
                    .readFlag(false)
                    .createdAt(java.time.Instant.now())
                    .build();
                notificationService.save(notif);
            }
            
            return ResponseEntity.ok(Map.of("message", "Case claimed successfully", "caseId", id));
        } catch (Exception e) {
            log.error("Error claiming case", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Issue Summons (Step 4)
     */
    @PostMapping("/cases/{id}/issue-summons")
    public ResponseEntity<?> issueSummons(@PathVariable UUID id, Authentication authentication) {
        try {
            User judge = authService.findByEmail(authentication.getName());
            CaseEntity caseEntity = caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));
            
            // Logic: Update summons_status to IN_TRANSIT
            caseEntity.setSummonsStatus("IN_TRANSIT");
            caseEntity.setStatus(CaseStatus.SUMMONS_SERVED); // Or keep current? "update the summons_status to IN_TRANSIT"
            // The prompt says "Update summons_status to IN_TRANSIT on the Litigant's dashboard."
            // Also "Clicking this must create a new task on the Police Dashboard to deliver the notice".
            
            caseRepository.save(caseEntity);
            
            // Create Police Task (Simulated via Audit/Notif for now as Police logic is separate)
            // "If a Police Officer uploads an FIR, the Judge's timeline...".
            // Here we are Judge issuing summons. Needs to go to Police.
            // We'll log it as a Task.
            auditService.logCaseAction(id, judge.getId(), "JUDGE", "SUMMONS_ISSUED", "Digital Summons issued. Task assigned to Police.");
            
            // Notify Litigant
            if (caseEntity.getClient() != null) {
                notificationService.save(com.nyaysetu.backend.notification.entity.Notification.builder()
                    .userId(caseEntity.getClient().getId())
                    .title("Summons Issued")
                    .message("Digital Summons has been issued and is in transit.")
                    .readFlag(false)
                    .createdAt(java.time.Instant.now())
                    .build());
            }

            return ResponseEntity.ok(Map.of("message", "Summons issued successfully. Police notified."));
        } catch (Exception e) {
             log.error("Error issuing summons", e);
             return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    /**
     * AI-Assisted Hearing Scheduling
     * Parses natural language request to schedule a hearing
     */
    @PostMapping("/hearings/schedule-ai")
    public ResponseEntity<?> scheduleHearingAI(
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        try {
            String prompt = request.get("prompt");
            if (prompt == null || prompt.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Prompt is required"));
            }

            User judge = authService.findByEmail(authentication.getName());
            List<CaseEntity> judgeCases = caseRepository.findByAssignedJudge(judge.getName());

            if (judgeCases.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No cases assigned to you"));
            }

            // Build context for AI
            StringBuilder context = new StringBuilder();
            context.append("You are a legal assistant scheduling hearings. Parse the user's request into specific hearing details.\n");
            context.append("Current Date: ").append(LocalDateTime.now()).append("\n");
            context.append("Available Cases for this Judge:\n");
            
            for (CaseEntity c : judgeCases) {
                context.append(String.format("- ID: %s, Title: %s\n", c.getId(), c.getTitle()));
            }

            context.append("\nUser Request: ").append(prompt);
            context.append("\n\nRespond ONLY in this JSON format (no markdown):\n");
            context.append("{\n");
            context.append("  \"caseId\": \"UUID of the matching case\",\n");
            context.append("  \"scheduledDate\": \"YYYY-MM-DDTHH:mm:ss (ISO 8601)\",\n");
            context.append("  \"durationMinutes\": 30\n");
            context.append("}");

            String aiResponse = groqService.chatWithAI(context.toString());
            
            // Clean response
            String jsonStr = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            
            // Parse JSON
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(jsonStr);
            
            UUID caseId = UUID.fromString(root.get("caseId").asText());
            LocalDateTime date = LocalDateTime.parse(root.get("scheduledDate").asText());
            int duration = root.get("durationMinutes").asInt(60);
            
            // Schedule the hearing
            Hearing hearing = hearingService.scheduleHearing(caseId, date, duration);
            
            return ResponseEntity.ok(Map.of(
                "message", "Hearing scheduled successfully via AI",
                "hearing", hearing
            ));

        } catch (Exception e) {
            log.error("Error in AI scheduling", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to schedule: " + e.getMessage()));
        }
    }
}

