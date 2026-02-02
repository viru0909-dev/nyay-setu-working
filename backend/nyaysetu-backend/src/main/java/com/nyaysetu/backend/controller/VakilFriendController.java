package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.ChatMessageRequest;
import com.nyaysetu.backend.dto.ChatSessionResponse;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.ChatSession;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.VakilFriendService;
import com.nyaysetu.backend.service.VakilFriendDocumentService;
import com.nyaysetu.backend.dto.DocumentAnalysisResponse;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller for Vakil-Friend AI Chat-First Case Filing
 */
@RestController
@RequestMapping("/api/vakil-friend")
@RequiredArgsConstructor
@Slf4j
public class VakilFriendController {

    private final VakilFriendService vakilFriendService;
    private final VakilFriendDocumentService vakilFriendDocumentService;
    private final UserRepository userRepository;

    /**
     * Start a new chat session for case assistance (linked to a specific case)
     */
    @PostMapping("/case/{caseId}/start")
    public ResponseEntity<Map<String, Object>> startCaseSession(
            @PathVariable UUID caseId,
            Authentication auth
    ) {
        try {
            User user = getCurrentUser(auth);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Not authenticated",
                    "message", "Please login to use Vakil-Friend"
                ));
            }
            
            ChatSession session = vakilFriendService.startCaseAssistanceSession(user, caseId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", session.getId());
            // Get initial message from conversation data
            String initialMessage = "I have reviewed your case. How can I help?";
            try {
                // Parse conversation to get the last message (which is the AI greeting)
                List<Map<String, Object>> msgs = new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                    session.getConversationData(), List.class
                );
                if (!msgs.isEmpty()) {
                    Map<String, Object> lastMsg = msgs.get(msgs.size() - 1);
                    if ("assistant".equals(lastMsg.get("role"))) {
                        initialMessage = (String) lastMsg.get("content");
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse initial message", e);
            }
            
            response.put("message", initialMessage);
            response.put("status", "ACTIVE");
            
            log.info("Started Vakil-Friend Case Assistance session {} for user {} on case {}", 
                    session.getId(), user.getEmail(), caseId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to start Vakil-Friend case session", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to start session",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Start a new chat session for case filing
     */
    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startSession(Authentication auth) {
        try {
            User user = getCurrentUser(auth);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Not authenticated",
                    "message", "Please login to use Vakil-Friend"
                ));
            }
            
            ChatSession session = vakilFriendService.startSession(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", session.getId());
            response.put("message", "🙏 Namaste! I am Vakil-Friend, your AI legal assistant. " +
                    "I'm here to help you file your legal case easily.\n\n" +
                    "Please tell me about your legal issue. What happened?");
            response.put("status", "ACTIVE");
            
            log.info("Started Vakil-Friend session {} for user {}", session.getId(), user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to start Vakil-Friend session", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to start session",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    /**
     * Upload and analyze a document
     */
    @PostMapping("/chat/{sessionId}/upload")
    public ResponseEntity<DocumentAnalysisResponse> uploadDocument(
            @PathVariable UUID sessionId,
            @RequestParam("file") MultipartFile file,
            Authentication auth
    ) {
        log.info("Uploading document for session {}", sessionId);
        DocumentAnalysisResponse response = vakilFriendDocumentService.uploadAndAnalyze(sessionId, file);
        return ResponseEntity.ok(response);
    }

    /**
     * Send a message in the chat session
     */
    @PostMapping("/chat/{sessionId}")
    public ResponseEntity<Map<String, Object>> chat(
            @PathVariable UUID sessionId,
            @RequestBody ChatMessageRequest request,
            Authentication auth
    ) {
        User user = getCurrentUser(auth);
        Map<String, Object> response = vakilFriendService.chat(sessionId, request, user);
        
        log.info("Processed message in session {}", sessionId);
        return ResponseEntity.ok(response);
    }

    /**
     * Complete the session and create a case
     */
    @PostMapping("/complete/{sessionId}")
    public ResponseEntity<Map<String, Object>> completeSession(
            @PathVariable UUID sessionId,
            Authentication auth
    ) {
        try {
            User user = getCurrentUser(auth);
            
            // Check if user is authenticated
            if (user == null) {
                log.error("User not authenticated for completeSession");
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "error", "Not authenticated",
                    "message", "Please login to file a case"
                ));
            }
            
            log.info("📋 Completing session {} for user {}", sessionId, user.getEmail());
            Object result = vakilFriendService.completeSession(sessionId, user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);

            if (result instanceof com.nyaysetu.backend.entity.FirRecord) {
                com.nyaysetu.backend.entity.FirRecord fir = (com.nyaysetu.backend.entity.FirRecord) result;
                response.put("message", "✅ Your FIR has been successfully sent to the Police!");
                // Map FIR fields to Case fields for frontend compatibility
                response.put("caseId", fir.getFirNumber());
                response.put("caseTitle", fir.getTitle());
                response.put("caseType", "FIR (Criminal)");
                response.put("status", "PENDING POLICE REVIEW");
                response.put("urgency", "CRITICAL"); // FIRs are usually urgent
                response.put("petitioner", user.getName());
                response.put("respondent", "Unknown (Police Investigation)");
                response.put("judgeAssigned", false);
                response.put("hearingScheduled", false);
                log.info("✅ Completed session {} and created FIR {}", sessionId, fir.getFirNumber());
            } else if (result instanceof CaseEntity) {
                CaseEntity createdCase = (CaseEntity) result;
                response.put("message", "✅ Your case has been successfully filed!");
                response.put("caseId", createdCase.getId());
                response.put("caseTitle", createdCase.getTitle());
                response.put("caseType", createdCase.getCaseType());
                response.put("status", createdCase.getStatus());
                response.put("urgency", createdCase.getUrgency());
                response.put("petitioner", createdCase.getPetitioner());
                response.put("respondent", createdCase.getRespondent());
                
                if (createdCase.getAssignedJudge() != null && !createdCase.getAssignedJudge().isEmpty()) {
                    response.put("assignedJudge", createdCase.getAssignedJudge());
                    response.put("judgeAssigned", true);
                } else {
                    response.put("judgeAssigned", false);
                }
                
                if (createdCase.getNextHearing() != null) {
                    response.put("nextHearing", createdCase.getNextHearing().toString());
                    response.put("hearingScheduled", true);
                } else {
                    response.put("hearingScheduled", false);
                }
                log.info("✅ Completed session {} and created CASE {}", sessionId, createdCase.getId());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to complete session: {}", e.getMessage(), e);
            String stackTrace = java.util.Arrays.toString(java.util.Arrays.copyOf(e.getStackTrace(), 5));
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to file case",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error",
                "debug_cause", e.toString(),
                "debug_stack", stackTrace
            ));
        }
    }

    /**
     * Get session details
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ChatSessionResponse> getSession(
            @PathVariable UUID sessionId,
            Authentication auth
    ) {
        ChatSession session = vakilFriendService.getSession(sessionId);
        
        ChatSessionResponse response = ChatSessionResponse.builder()
                .sessionId(session.getId())
                .status(session.getStatus().name())
                .title(session.getTitle())
                .conversationData(session.getConversationData())
                .createdAt(session.getCreatedAt())
                .build();
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get user's chat sessions
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSessionResponse>> getUserSessions(Authentication auth) {
        User user = getCurrentUser(auth);
        List<ChatSession> sessions = vakilFriendService.getUserSessions(user);
        
        List<ChatSessionResponse> response = sessions.stream()
                .map(s -> ChatSessionResponse.builder()
                        .sessionId(s.getId())
                        .status(s.getStatus().name())
                        .title(s.getTitle())
                        .createdAt(s.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    private User getCurrentUser(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            log.warn("No authentication found for Vakil-Friend request");
            return null;
        }
        String email = auth.getName();
        return userRepository.findByEmail(email).orElse(null);
    }
}
