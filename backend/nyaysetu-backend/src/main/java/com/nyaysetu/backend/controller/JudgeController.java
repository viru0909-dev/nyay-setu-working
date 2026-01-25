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

    /**
     * Get all cases assigned to the logged-in judge
     */
    @GetMapping("/cases")
    public ResponseEntity<?> getJudgeCases(Authentication authentication) {
        try {
            User judge = authService.findByEmail(authentication.getName());
            String judgeName = judge.getName();
            List<CaseEntity> cases = caseRepository.findByAssignedJudge(judgeName);
            
            List<Map<String, Object>> response = cases.stream().map(c -> {
                Map<String, Object> caseData = new HashMap<>();
                caseData.put("id", c.getId());
                caseData.put("title", c.getTitle());
                caseData.put("description", c.getDescription());
                caseData.put("caseType", c.getCaseType());
                caseData.put("status", c.getStatus().name());
                caseData.put("petitioner", c.getPetitioner());
                caseData.put("respondent", c.getRespondent());
                caseData.put("filedDate", c.getFiledDate());
                caseData.put("nextHearingDate", c.getNextHearing());
                caseData.put("urgencyLevel", c.getUrgency());
                return caseData;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching judge cases", e);
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * Get pending cases (status = PENDING or FILED)
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingCases(Authentication authentication) {
        try {
            User judge = authService.findByEmail(authentication.getName());
            String judgeName = judge.getName();
            List<CaseEntity> allCases = caseRepository.findByAssignedJudge(judgeName);
            
            List<Map<String, Object>> pending = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.PENDING || c.getStatus() == CaseStatus.OPEN)
                .map(c -> {
                    Map<String, Object> caseData = new HashMap<>();
                    caseData.put("id", c.getId());
                    caseData.put("title", c.getTitle());
                    caseData.put("description", c.getDescription());
                    caseData.put("caseType", c.getCaseType());
                    caseData.put("status", c.getStatus().name());
                    caseData.put("petitioner", c.getPetitioner());
                    caseData.put("respondent", c.getRespondent());
                    caseData.put("filedDate", c.getFiledDate());
                    caseData.put("nextHearingDate", c.getNextHearing());
                    caseData.put("urgencyLevel", c.getUrgency());
                    return caseData;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(pending);
        } catch (Exception e) {
            log.error("Error fetching pending cases", e);
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * Get today's hearings for the judge
     */
    @GetMapping("/hearings/today")
    public ResponseEntity<?> getTodaysHearings(Authentication authentication) {
        try {
            User judge = authService.findByEmail(authentication.getName());
            String judgeName = judge.getName();
            Long judgeId = judge.getId();
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(7);
            
            List<Hearing> allHearings = hearingRepository.findByScheduledDateBetween(startOfDay, endOfDay);
            
            // Filter to only judge's cases - check both assignedJudge name AND judgeId
            List<CaseEntity> judgeCasesByName = caseRepository.findByAssignedJudge(judgeName);
            List<CaseEntity> judgeCasesById = caseRepository.findByJudgeId(judgeId);
            
            Set<UUID> judgeCaseIds = new HashSet<>();
            judgeCasesByName.forEach(c -> judgeCaseIds.add(c.getId()));
            judgeCasesById.forEach(c -> judgeCaseIds.add(c.getId()));
            
            log.info("Judge {} has {} cases by name, {} cases by ID", judgeName, judgeCasesByName.size(), judgeCasesById.size());
            
            List<Map<String, Object>> todaysHearings = allHearings.stream()
                .filter(h -> h.getCaseEntity() != null && judgeCaseIds.contains(h.getCaseEntity().getId()))
                .map(h -> {
                    Map<String, Object> hearing = new HashMap<>();
                    hearing.put("id", h.getId());
                    hearing.put("scheduledDate", h.getScheduledDate());
                    hearing.put("status", h.getStatus().name());
                    hearing.put("videoRoomId", h.getVideoRoomId());
                    hearing.put("durationMinutes", h.getDurationMinutes());
                    if (h.getCaseEntity() != null) {
                        hearing.put("caseTitle", h.getCaseEntity().getTitle());
                        hearing.put("caseId", h.getCaseEntity().getId());
                    }
                    return hearing;
                }).collect(Collectors.toList());
            
            return ResponseEntity.ok(todaysHearings);
        } catch (Exception e) {
            log.error("Error fetching today's hearings", e);
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * Get analytics for judge dashboard
     */
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(Authentication authentication) {
        try {
            User judge = authService.findByEmail(authentication.getName());
            String judgeName = judge.getName();
            List<CaseEntity> cases = caseRepository.findByAssignedJudge(judgeName);
            
            Map<String, Object> analytics = new HashMap<>();
            
            // Case counts by status
            Map<String, Long> statusCounts = cases.stream()
                .collect(Collectors.groupingBy(c -> c.getStatus().name(), Collectors.counting()));
            analytics.put("byStatus", statusCounts);
            
            // Case counts by type
            Map<String, Long> typeCounts = cases.stream()
                .filter(c -> c.getCaseType() != null)
                .collect(Collectors.groupingBy(CaseEntity::getCaseType, Collectors.counting()));
            analytics.put("byType", typeCounts);
            
            // Total counts
            analytics.put("totalCases", cases.size());
            analytics.put("pendingCases", cases.stream().filter(c -> 
                c.getStatus() == CaseStatus.PENDING || c.getStatus() == CaseStatus.OPEN).count());
            analytics.put("activeCases", cases.stream().filter(c -> 
                c.getStatus() == CaseStatus.IN_PROGRESS).count());
            analytics.put("closedCases", cases.stream().filter(c -> 
                c.getStatus() == CaseStatus.CLOSED || c.getStatus() == CaseStatus.COMPLETED).count());
            
            // Monthly trend (last 6 months)
            LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
            Map<String, Long> monthlyTrend = cases.stream()
                .filter(c -> c.getFiledDate() != null && c.getFiledDate().isAfter(sixMonthsAgo))
                .collect(Collectors.groupingBy(
                    c -> c.getFiledDate().getMonth().toString().substring(0, 3),
                    Collectors.counting()
                ));
            analytics.put("monthlyTrend", monthlyTrend);
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error fetching analytics", e);
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }

    /**
     * AI Chat for case management - chat with AI about a specific case
     */
    @PostMapping("/ai-chat")
    public ResponseEntity<?> aiCaseChat(
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        try {
            String message = (String) request.get("message");
            String caseIdStr = (String) request.get("caseId");
            
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
            }
            
            // Build context
            StringBuilder context = new StringBuilder();
            context.append("You are a legal AI assistant for a judge in the NyaySetu e-court system. ");
            context.append("Help the judge with case analysis, procedural guidance, and document review. ");
            
            if (caseIdStr != null && !caseIdStr.isEmpty()) {
                UUID caseId = UUID.fromString(caseIdStr);
                CaseEntity caseEntity = caseRepository.findById(caseId).orElse(null);
                
                if (caseEntity != null) {
                    context.append("\n\nCURRENT CASE CONTEXT:\n");
                    context.append("Title: ").append(caseEntity.getTitle()).append("\n");
                    context.append("Type: ").append(caseEntity.getCaseType()).append("\n");
                    context.append("Status: ").append(caseEntity.getStatus()).append("\n");
                    context.append("Petitioner: ").append(caseEntity.getPetitioner()).append("\n");
                    context.append("Respondent: ").append(caseEntity.getRespondent()).append("\n");
                    context.append("Description: ").append(caseEntity.getDescription()).append("\n");
                    
                    if (caseEntity.getAiGeneratedSummary() != null) {
                        context.append("AI Summary: ").append(caseEntity.getAiGeneratedSummary()).append("\n");
                    }
                    
                    // Include documents info
                    List<DocumentEntity> docs = documentRepository.findByCaseId(caseId);
                    if (!docs.isEmpty()) {
                        context.append("\nUPLOADED DOCUMENTS (").append(docs.size()).append("):\n");
                        for (DocumentEntity doc : docs) {
                            context.append("- ").append(doc.getFileName());
                            if (doc.getCategory() != null) {
                                context.append(" [").append(doc.getCategory()).append("]");
                            }
                            context.append("\n");
                        }
                    }
                }
            }
            
            context.append("\n\nJUDGE'S QUESTION: ").append(message);
            
            // Call Groq AI
            String aiResponse = groqService.chatWithAI(context.toString());
            
            return ResponseEntity.ok(Map.of(
                "response", aiResponse,
                "timestamp", LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            log.error("AI chat error", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get AI summary for a specific case
     */
    @GetMapping("/case/{caseId}/ai-summary")
    public ResponseEntity<?> getAICaseSummary(@PathVariable UUID caseId) {
        try {
            CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));
            
            // Build detailed context for AI
            StringBuilder prompt = new StringBuilder();
            prompt.append("Generate a comprehensive legal case summary for a judge. Include:\n");
            prompt.append("1. Key facts and claims\n");
            prompt.append("2. Legal issues involved\n");
            prompt.append("3. Relevant laws/precedents to consider\n");
            prompt.append("4. Suggested action items\n\n");
            prompt.append("CASE DETAILS:\n");
            prompt.append("Title: ").append(caseEntity.getTitle()).append("\n");
            prompt.append("Type: ").append(caseEntity.getCaseType()).append("\n");
            prompt.append("Petitioner: ").append(caseEntity.getPetitioner()).append("\n");
            prompt.append("Respondent: ").append(caseEntity.getRespondent()).append("\n");
            prompt.append("Description: ").append(caseEntity.getDescription()).append("\n");
            
            String summary = groqService.chatWithAI(prompt.toString());
            
            // Save summary to case
            caseEntity.setAiGeneratedSummary(summary);
            caseRepository.save(caseEntity);
            
            return ResponseEntity.ok(Map.of(
                "caseId", caseId,
                "summary", summary,
                "generatedAt", LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            log.error("Error generating AI summary", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get unassigned cases (cases with no judge)
     */
    @GetMapping("/unassigned")
    public ResponseEntity<?> getUnassignedCases() {
        try {
            // Use the more robust query that handles both null and empty string
            List<CaseEntity> cases = caseRepository.findUnassignedCases();
            
            List<Map<String, Object>> response = cases.stream().map(c -> {
                Map<String, Object> caseData = new HashMap<>();
                caseData.put("id", c.getId());
                caseData.put("title", c.getTitle());
                caseData.put("description", c.getDescription());
                caseData.put("caseType", c.getCaseType());
                caseData.put("status", c.getStatus().name());
                caseData.put("petitioner", c.getPetitioner());
                caseData.put("respondent", c.getRespondent());
                caseData.put("filedDate", c.getFiledDate());
                caseData.put("urgencyLevel", c.getUrgency());
                return caseData;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching unassigned cases", e);
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * Claim a case from the unassigned pool
     */
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
            caseEntity.setStatus(CaseStatus.OPEN);
            caseRepository.save(caseEntity);
            
            return ResponseEntity.ok(Map.of("message", "Case claimed successfully", "caseId", id));
        } catch (Exception e) {
            log.error("Error claiming case", e);
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

