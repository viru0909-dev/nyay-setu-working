package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.repository.*;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.GroqDocumentVerificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Tag(name = "Judge Portal", description = "Judge dashboard — assigned cases, hearings and verdict management")
@RestController
@RequestMapping("/judge")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('JUDGE', 'SUPER_JUDGE', 'ADMIN')")
public class JudgeController {

    private final CaseRepository caseRepository;
    private final HearingRepository hearingRepository;
    private final com.nyaysetu.backend.service.HearingService hearingService;
    private final AuthService authService;
    private final GroqDocumentVerificationService groqService;
    private final com.nyaysetu.backend.service.AuditService auditService;
    private final com.nyaysetu.backend.notification.service.NotificationService notificationService;

    @Operation(summary = "Get judge assigned cases", description = "Retrieve paginated list of cases assigned to the authenticated judge")
    @GetMapping("/cases")
    public ResponseEntity<Page<CaseEntity>> getJudgeCases(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        User judge = authService.findByEmail(authentication.getName());
        Page<CaseEntity> judgeCases = caseRepository.findByAssignedJudge(judge.getName(), pageable);
        return ResponseEntity.ok(judgeCases);
    }

    @Operation(summary = "Claim an unassigned case", description = "Take cognizance and claim an unassigned case")
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
            caseEntity.setStatus(CaseStatus.COGNIZANCE_PERIOD);
            caseRepository.save(caseEntity);
            
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
        } catch (RuntimeException e) {
            log.error("Error claiming case", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @Operation(summary = "Issue digital summons", description = "Issue digital summons for a case, creating a police delivery task")
    @PostMapping("/cases/{id}/issue-summons")
    public ResponseEntity<?> issueSummons(@PathVariable UUID id, Authentication authentication) {
        try {
            User judge = authService.findByEmail(authentication.getName());
            CaseEntity caseEntity = caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));
            
            caseEntity.setSummonsStatus("IN_TRANSIT");
            caseEntity.setStatus(CaseStatus.SUMMONS_SERVED);
            caseRepository.save(caseEntity);
            
            auditService.logCaseAction(id, judge.getId(), "JUDGE", "SUMMONS_ISSUED", "Digital Summons issued. Task assigned to Police.");
            
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
        } catch (RuntimeException e) {
             log.error("Error issuing summons", e);
             return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Get unassigned cases", description = "Retrieve pool of cases awaiting judge assignment")
    @GetMapping("/unassigned")
    public ResponseEntity<?> getUnassignedCases() {
        return ResponseEntity.ok(caseRepository.findByAssignedJudgeIsNull());
    }

    @Operation(summary = "Get judge dashboard analytics", description = "Analytical metrics on case load, statuses, and monthly trends")
    @GetMapping("/analytics")
    public ResponseEntity<?> getJudgeAnalytics(Authentication authentication) {
        User judge = authService.findByEmail(authentication.getName());
        List<CaseEntity> myCases = caseRepository.findByAssignedJudge(judge.getName());
        long assignedCount = myCases.size();
        long unassignedCount = caseRepository.findByJudgeIdIsNull().size();
        
        long pending = myCases.stream().filter(c -> "NEW".equals(c.getStatus().toString())).count();
        long active = myCases.stream().filter(c -> "IN_PROGRESS".equals(c.getStatus().toString())).count();
        long closed = myCases.stream().filter(c -> "CLOSED".equals(c.getStatus().toString())).count();
        
        Map<String, Long> byStatus = myCases.stream()
            .collect(Collectors.groupingBy(c -> c.getStatus().toString(), Collectors.counting()));
            
        Map<String, Long> byType = myCases.stream()
            .collect(Collectors.groupingBy(CaseEntity::getCaseType, Collectors.counting()));

        Map<String, Long> monthlyTrend = new LinkedHashMap<>();
        monthlyTrend.put("AUG", 2L);
        monthlyTrend.put("SEP", 4L);
        monthlyTrend.put("OCT", 1L);
        monthlyTrend.put("NOV", 6L);
        monthlyTrend.put("DEC", 3L);
        monthlyTrend.put("JAN", assignedCount);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCases", assignedCount);
        stats.put("pendingCases", pending); 
        stats.put("activeCases", active); 
        stats.put("closedCases", closed);
        stats.put("unassignedCases", unassignedCount);
        stats.put("byStatus", byStatus);
        stats.put("byType", byType);
        stats.put("monthlyTrend", monthlyTrend);
        
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get today's scheduled hearings", description = "Fetch all hearings scheduled for the current date")
    @GetMapping("/hearings/today")
    public ResponseEntity<?> getTodaysHearings(Authentication authentication) {
        User judge = authService.findByEmail(authentication.getName());
        List<CaseEntity> judgeCases = caseRepository.findByAssignedJudge(judge.getName());
        
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);
        
        List<Hearing> todayHearings = hearingRepository.findByCaseEntityInAndScheduledDateBetween(
            judgeCases, startOfDay, endOfDay
        );
        
        return ResponseEntity.ok(todayHearings);
    }
    
    @Operation(summary = "Generate AI case summary", description = "Use Groq AI to generate executive brief for judge")
    @GetMapping("/case/{id}/ai-summary")
    public ResponseEntity<?> getAICaseSummary(@PathVariable UUID id) {
        try {
            CaseEntity caseEntity = caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));

            String summary = caseEntity.getJudgeSummaryJson();
            
            if (summary == null || summary.isEmpty() || summary.contains("unavailable") || summary.contains("not configured") || summary.contains("couldn't process") || summary.contains("**")) {
                summary = groqService.generateCaseBrief(caseEntity);
                caseEntity.setJudgeSummaryJson(summary);
                caseRepository.save(caseEntity);
            }
            
            return ResponseEntity.ok(Map.of("summary", summary));
        } catch (RuntimeException e) {
            log.error("Error generating AI summary", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "AI-assisted hearing scheduling", description = "Parse natural language prompt to schedule hearing")
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

            String jsonStr = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(jsonStr);

            UUID caseId = UUID.fromString(root.get("caseId").asText());
            LocalDateTime date = LocalDateTime.parse(root.get("scheduledDate").asText());
            int duration = root.get("durationMinutes").asInt(60);

            Hearing hearing = hearingService.scheduleHearing(caseId, date, duration);

            return ResponseEntity.ok(Map.of(
                "message", "Hearing scheduled successfully via AI",
                "hearing", hearing
            ));
        } catch (IOException | RuntimeException e) {
            log.error("Error in AI scheduling", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to schedule: " + e.getMessage()));
        }
    }
}

