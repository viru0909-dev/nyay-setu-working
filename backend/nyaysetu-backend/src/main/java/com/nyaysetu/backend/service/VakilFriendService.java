package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nyaysetu.backend.entity.ChatSession;
import com.nyaysetu.backend.entity.ChatSessionStatus;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.entity.Hearing;
import com.nyaysetu.backend.entity.HearingStatus;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.ChatSessionRepository;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.HearingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Vakil-Friend AI Service for Chat-First Case Filing
 * Uses Groq API (free, fast Llama models) for full conversational AI
 * Falls back to OllamaService if Groq unavailable
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VakilFriendService {

    @Value("${groq.api.key:}")
    private String groqApiKey;
    
    @Value("${groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ChatSessionRepository chatSessionRepository;
    private final CaseRepository caseRepository;
    private final HearingRepository hearingRepository;
    private final OllamaService ollamaService;
    
    // Lazy injection to avoid circular dependency
    @Autowired
    @Lazy
    private CaseAssignmentService caseAssignmentService;

    // Groq API - Fast, free Llama models
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    private static final String SYSTEM_PROMPT = """
        You are Vakil-Friend, an AI legal assistant for Nyay-Setu, India's digital judiciary platform.
        
        Your role is to help citizens file legal cases by collecting information step by step.
        
        REQUIRED INFORMATION TO COLLECT (ask one at a time):
        1. ISSUE: What happened? (the main problem/incident)
        2. CASE_TYPE: Is this CIVIL, CRIMINAL, FAMILY, PROPERTY, or COMMERCIAL?
        3. PETITIONER: What is your full name? (the person filing)
        4. RESPONDENT: Who are you filing against? (name of opposing party)
        5. INCIDENT_DATE: When did this happen?
        6. EVIDENCE: Do you have any proof? (documents, photos, witnesses)
        7. URGENCY: How urgent is this? (NORMAL, URGENT, or CRITICAL)
        
        CONVERSATION FLOW:
        - Start by asking about their legal issue
        - Ask ONE question at a time
        - Be empathetic and supportive
        - Use simple language (avoid legal jargon)
        - Respond in the same language (Hindi or English)
        
        WHEN ALL INFO IS COLLECTED:
        Summarize the case with this format:
        
        **CASE SUMMARY**
        - Case Type: [TYPE]
        - Petitioner: [NAME]
        - Respondent: [NAME]
        - Issue: [DESCRIPTION]
        - Urgency: [LEVEL]
        
        Then say: "Your case is ready to file! Click the 'Complete Filing' button to submit."
        """;

    /**
     * Start a new chat session for case filing
     */
    @Transactional
    public ChatSession startSession(User user) {
        ChatSession session = ChatSession.builder()
                .user(user)
                .status(ChatSessionStatus.ACTIVE)
                .conversationData("[]")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        return chatSessionRepository.save(session);
    }

    /**
     * Send a message to Vakil-Friend and get response
     */
    @Transactional
    public Map<String, Object> chat(UUID sessionId, String userMessage, User user) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        if (session.getStatus() != ChatSessionStatus.ACTIVE) {
            throw new RuntimeException("Chat session is no longer active");
        }

        // Parse existing conversation
        List<Map<String, String>> conversation;
        try {
            conversation = objectMapper.readValue(
                    session.getConversationData(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
            );
        } catch (Exception e) {
            conversation = new ArrayList<>();
        }

        // Add user message
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        conversation.add(userMsg);

        // Get AI response
        String aiResponse = getAIResponse(conversation);

        // Add AI response
        Map<String, String> assistantMsg = new HashMap<>();
        assistantMsg.put("role", "assistant");
        assistantMsg.put("content", aiResponse);
        conversation.add(assistantMsg);

        // Save updated conversation
        try {
            session.setConversationData(objectMapper.writeValueAsString(conversation));
        } catch (Exception e) {
            log.error("Failed to serialize conversation", e);
        }
        session.setUpdatedAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        // Check if ready to create case (simple heuristic)
        boolean readyToFile = isReadyToFile(conversation);

        Map<String, Object> result = new HashMap<>();
        result.put("sessionId", sessionId);
        result.put("message", aiResponse);
        result.put("readyToFile", readyToFile);

        return result;
    }

    /**
     * Complete the chat session and create a case
     */
    @Transactional
    public CaseEntity completeSession(UUID sessionId, User user) {
        log.info("📋 Starting completeSession for session: {}, user: {}", sessionId, user != null ? user.getEmail() : "null");
        
        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }
        
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));
        log.info("📋 Found session, extracting case data");

        // Extract case data from conversation
        Map<String, String> caseData = extractCaseData(session.getConversationData());
        log.info("📋 Extracted case data: type={}, urgency={}", caseData.get("caseType"), caseData.get("urgency"));

        // Limit chatTranscript to prevent DB issues
        String chatTranscript = session.getConversationData();
        if (chatTranscript != null && chatTranscript.length() > 10000) {
            chatTranscript = chatTranscript.substring(0, 10000) + "... [truncated]";
        }

        // Create the case
        CaseEntity newCase = CaseEntity.builder()
                .title(caseData.getOrDefault("title", "Case filed via Vakil-Friend"))
                .description(caseData.getOrDefault("description", ""))
                .caseType(caseData.getOrDefault("caseType", "CIVIL"))
                .petitioner(caseData.getOrDefault("petitioner", user.getEmail()))
                .respondent(caseData.getOrDefault("respondent", "Unknown"))
                .urgency(caseData.getOrDefault("urgency", "NORMAL"))
                .status(CaseStatus.PENDING)
                .client(user)
                .filingMethod("CHAT_AI")
                .chatTranscript(chatTranscript)
                .aiGeneratedSummary(generateSummary(session.getConversationData()))
                .build();
        log.info("📋 Built CaseEntity, saving to database");

        CaseEntity savedCase = caseRepository.save(newCase);
        log.info("📋 Saved case with ID: {}", savedCase.getId());

        // AUTO-ASSIGN: Automatically assign a judge to the case
        try {
            caseAssignmentService.autoAssignJudge(savedCase.getId());
            // Refresh the case to get the assigned judge
            savedCase = caseRepository.findById(savedCase.getId()).orElse(savedCase);
            log.info("✅ Auto-assigned judge to case {}: {}", savedCase.getId(), savedCase.getAssignedJudge());
        } catch (Exception e) {
            log.warn("Could not auto-assign judge to case {}: {}", savedCase.getId(), e.getMessage());
            // Continue without judge assignment - can be done manually by admin
        }

        // AUTO-SCHEDULE: Automatically schedule first hearing
        try {
            savedCase = autoScheduleHearing(savedCase, caseData.get("urgency"));
            log.info("📅 Auto-scheduled hearing for case {}", savedCase.getId());
        } catch (Exception e) {
            log.warn("Could not auto-schedule hearing for case {}: {}", savedCase.getId(), e.getMessage());
        }

        // Mark session as completed
        session.setStatus(ChatSessionStatus.COMPLETED);
        session.setCaseEntity(savedCase);
        session.setUpdatedAt(LocalDateTime.now());
        chatSessionRepository.save(session);
        log.info("✅ Session marked as completed");

        return savedCase;
    }
    
    /**
     * Auto-schedule the first hearing for a case
     * Urgent cases get earlier dates (7 days), normal cases get 14 days
     */
    private CaseEntity autoScheduleHearing(CaseEntity caseEntity, String urgency) {
        // Determine hearing date based on urgency
        int daysFromNow;
        if ("CRITICAL".equalsIgnoreCase(urgency)) {
            daysFromNow = 3;  // Critical: 3 days
        } else if ("URGENT".equalsIgnoreCase(urgency)) {
            daysFromNow = 7;  // Urgent: 7 days
        } else {
            daysFromNow = 14; // Normal: 14 days
        }
        
        // Schedule hearing at 10:00 AM on the target date
        LocalDateTime hearingDate = LocalDateTime.now()
                .plusDays(daysFromNow)
                .withHour(10)
                .withMinute(0)
                .withSecond(0);
        
        // Create hearing
        Hearing hearing = Hearing.builder()
                .caseEntity(caseEntity)
                .scheduledDate(hearingDate)
                .durationMinutes(60)
                .videoRoomId("room-" + caseEntity.getId().toString().substring(0, 8))
                .status(HearingStatus.SCHEDULED)
                .build();
        
        hearingRepository.save(hearing);
        
        // Update case with next hearing date
        caseEntity.setNextHearing(hearingDate);
        return caseRepository.save(caseEntity);
    }

    /**
     * Get AI response - Uses Groq API (free, fast Llama) for full conversational AI
     */
    private String getAIResponse(List<Map<String, String>> conversation) {
        // Try Groq API first for full GPT-like behavior
        if (groqApiKey != null && !groqApiKey.isEmpty()) {
            try {
                String groqResponse = callGroqAPI(conversation);
                if (groqResponse != null && !groqResponse.isEmpty()) {
                    log.info("✅ Groq API response received");
                    return groqResponse;
                }
            } catch (Exception e) {
                log.warn("Groq API error: {}", e.getMessage());
            }
        } else {
            log.warn("Groq API key not configured. Get free key at: https://console.groq.com");
        }
        
        // Fallback to OllamaService (instant local responses)
        try {
            String lastUserMessage = "";
            if (!conversation.isEmpty()) {
                lastUserMessage = conversation.get(conversation.size() - 1).get("content");
            }
            
            var ollamaResponse = ollamaService.chat(lastUserMessage);
            if (ollamaResponse != null && ollamaResponse.getResponse() != null) {
                log.info("Using OllamaService fallback");
                return ollamaResponse.getResponse();
            }
        } catch (Exception e) {
            log.warn("OllamaService error: {}", e.getMessage());
        }
        
        // Final fallback - smart responses
        return getSmartFallbackResponse(conversation);
    }
    
    /**
     * Call Groq API for full conversational AI (OpenAI-compatible format)
     */
    private String callGroqAPI(List<Map<String, String>> conversation) throws Exception {
        // Build messages array
        ArrayNode messagesArray = objectMapper.createArrayNode();
        
        // Add system message
        ObjectNode systemMsg = objectMapper.createObjectNode();
        systemMsg.put("role", "system");
        systemMsg.put("content", SYSTEM_PROMPT);
        messagesArray.add(systemMsg);
        
        // Add conversation history
        for (Map<String, String> msg : conversation) {
            ObjectNode msgNode = objectMapper.createObjectNode();
            msgNode.put("role", msg.get("role").equals("assistant") ? "assistant" : "user");
            msgNode.put("content", msg.get("content"));
            messagesArray.add(msgNode);
        }
        
        // Build request body
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", groqModel);
        requestBody.set("messages", messagesArray);
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 1024);
        
        // Make API call
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);
        
        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
        
        ResponseEntity<String> response = restTemplate.exchange(
            GROQ_API_URL, 
            HttpMethod.POST, 
            entity, 
            String.class
        );
        
        // Parse response
        JsonNode jsonResponse = objectMapper.readTree(response.getBody());
        String aiText = jsonResponse
                .path("choices").path(0)
                .path("message").path("content")
                .asText();
        
        return aiText;
    }

    /**
     * Smart fallback when API is unavailable
     */
    private String getSmartFallbackResponse(List<Map<String, String>> conversation) {
        int messageCount = conversation.size();

        // First message - greeting
        if (messageCount <= 1) {
            return "🙏 Namaste! I am Vakil-Friend, your AI legal assistant. " +
                   "I'm here to help you file your legal case easily.\n\n" +
                   "Please tell me about your legal issue. What happened?";
        }

        String lastMessage = conversation.get(conversation.size() - 1).get("content").toLowerCase();

        // Progress through case filing
        if (messageCount == 2) {
            return "I understand. This seems serious. Let me help you file this case.\n\n" +
                   "First, what type of case is this?\n" +
                   "1️⃣ CIVIL (property, contracts, money disputes)\n" +
                   "2️⃣ CRIMINAL (violence, theft, fraud)\n" +
                   "3️⃣ FAMILY (divorce, custody, inheritance)\n" +
                   "4️⃣ PROPERTY (land disputes, ownership)\n" +
                   "5️⃣ COMMERCIAL (business, trade matters)";
        }

        if (messageCount == 3) {
            return "Thank you. Now, please provide your full name (you will be the Petitioner in this case).";
        }

        if (messageCount == 4) {
            return "Got it. Who is the person/organization you are filing the case against? (Respondent name)";
        }

        if (messageCount == 5) {
            return "Now, please provide a detailed description of the incident. " +
                   "Include dates, locations, and what exactly happened.";
        }

        if (messageCount == 6) {
            return "Do you have any evidence or proof to support your case? " +
                   "(documents, photos, videos, witnesses)\n\n" +
                   "You can describe what you have, and upload files after filing.";
        }

        if (messageCount == 7) {
            return "Finally, how urgent is this matter?\n" +
                   "1️⃣ NORMAL - Can wait for regular court process\n" +
                   "2️⃣ URGENT - Needs faster attention\n" +
                   "3️⃣ CRITICAL - Immediate threat or time-sensitive";
        }

        // Ready to file
        return "✅ I have collected all the required information!\n\n" +
               "**Summary of your case:**\n" +
               "- Your complaint has been documented\n" +
               "- All parties are identified\n" +
               "- Evidence details noted\n\n" +
               "Click the **'Complete Filing'** button to submit your case. " +
               "A judge will be automatically assigned, and you'll receive updates.";
    }

    /**
     * Check if we have enough information to file - looks for CASE SUMMARY in AI response
     */
    private boolean isReadyToFile(List<Map<String, String>> conversation) {
        // Check if AI has summarized the case (indicates all info collected)
        for (Map<String, String> msg : conversation) {
            if ("assistant".equals(msg.get("role"))) {
                String content = msg.get("content").toLowerCase();
                if (content.contains("case summary") || 
                    content.contains("ready to file") ||
                    content.contains("complete filing")) {
                    return true;
                }
            }
        }
        // Fallback: if we have 8+ messages, we likely have enough info
        return conversation.size() >= 8;
    }

    /**
     * Extract case data from conversation - parses AI summary and user messages
     */
    private Map<String, String> extractCaseData(String conversationJson) {
        Map<String, String> caseData = new HashMap<>();

        try {
            List<Map<String, String>> conversation = objectMapper.readValue(
                    conversationJson,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
            );

            StringBuilder userText = new StringBuilder();
            StringBuilder aiText = new StringBuilder();
            String firstUserMessage = "";
            
            for (Map<String, String> msg : conversation) {
                String content = msg.get("content");
                if ("user".equals(msg.get("role"))) {
                    if (firstUserMessage.isEmpty()) {
                        firstUserMessage = content;
                    }
                    userText.append(content).append(" ");
                } else {
                    aiText.append(content).append(" ");
                }
            }

            String text = userText.toString().toLowerCase();
            String aiSummary = aiText.toString();

            // Extract case type from keywords
            if (text.contains("criminal") || text.contains("attack") || text.contains("violence") || 
                text.contains("murder") || text.contains("theft") || text.contains("assault")) {
                caseData.put("caseType", "CRIMINAL");
            } else if (text.contains("family") || text.contains("divorce") || text.contains("custody") || 
                       text.contains("marriage") || text.contains("alimony")) {
                caseData.put("caseType", "FAMILY");
            } else if (text.contains("property") || text.contains("land") || text.contains("house") || 
                       text.contains("rent") || text.contains("tenant")) {
                caseData.put("caseType", "PROPERTY");
            } else if (text.contains("business") || text.contains("commercial") || text.contains("company") || 
                       text.contains("contract") || text.contains("fraud")) {
                caseData.put("caseType", "COMMERCIAL");
            } else {
                caseData.put("caseType", "CIVIL");
            }

            // Extract urgency
            if (text.contains("critical") || text.contains("emergency") || text.contains("immediate")) {
                caseData.put("urgency", "CRITICAL");
            } else if (text.contains("urgent") || text.contains("asap") || text.contains("soon")) {
                caseData.put("urgency", "URGENT");
            } else {
                caseData.put("urgency", "NORMAL");
            }

            // Try to extract names from AI summary (if present)
            if (aiSummary.contains("Petitioner:")) {
                String petitioner = extractAfterLabel(aiSummary, "Petitioner:");
                if (!petitioner.isEmpty()) {
                    // Truncate petitioner to 200 chars
                    if (petitioner.length() > 200) petitioner = petitioner.substring(0, 200);
                    caseData.put("petitioner", petitioner);
                }
            }
            if (aiSummary.contains("Respondent:")) {
                String respondent = extractAfterLabel(aiSummary, "Respondent:");
                if (!respondent.isEmpty()) {
                    // Truncate respondent to 200 chars
                    if (respondent.length() > 200) respondent = respondent.substring(0, 200);
                    caseData.put("respondent", respondent);
                }
            }

            // Generate title from first user message - TRUNCATE to 200 chars max
            String title;
            if (firstUserMessage.length() > 0) {
                String[] words = firstUserMessage.split("\\s+");
                title = String.join(" ", Arrays.copyOfRange(words, 0, Math.min(8, words.length)));
                if (title.length() > 200) title = title.substring(0, 200);
                title = title + "...";
            } else {
                title = "Case filed via Vakil-Friend";
            }
            caseData.put("title", title);

            // Use first user message as description - TRUNCATE to 1000 chars
            String description = firstUserMessage;
            if (description.length() > 1000) {
                description = description.substring(0, 1000) + "...";
            }
            caseData.put("description", description);

            // Set defaults for missing data - ensure they're also truncated
            caseData.putIfAbsent("petitioner", "Petitioner");
            caseData.putIfAbsent("respondent", "Respondent");

        } catch (Exception e) {
            log.error("Error extracting case data", e);
        }

        return caseData;
    }
    
    /**
     * Helper to extract text after a label
     */
    private String extractAfterLabel(String text, String label) {
        int idx = text.indexOf(label);
        if (idx >= 0) {
            String after = text.substring(idx + label.length());
            int endIdx = after.indexOf("\n");
            if (endIdx < 0) endIdx = Math.min(50, after.length());
            return after.substring(0, endIdx).trim().replace("[", "").replace("]", "");
        }
        return "";
    }

    /**
     * Generate AI summary for judge
     */
    private String generateSummary(String conversationJson) {
        try {
            List<Map<String, String>> conversation = objectMapper.readValue(
                    conversationJson,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
            );

            StringBuilder summary = new StringBuilder();
            summary.append("## Vakil-Friend Case Summary\n\n");
            summary.append("**Filing Method:** AI-Assisted Chat\n");
            summary.append("**Messages Exchanged:** ").append(conversation.size()).append("\n\n");
            summary.append("**Key Points from Complainant:**\n");

            for (Map<String, String> msg : conversation) {
                if ("user".equals(msg.get("role"))) {
                    summary.append("- ").append(msg.get("content")).append("\n");
                }
            }

            return summary.toString();

        } catch (Exception e) {
            return "AI summary generation failed";
        }
    }

    /**
     * Get session by ID
     */
    public ChatSession getSession(UUID sessionId) {
        return chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));
    }

    /**
     * Get user's active sessions
     */
    public List<ChatSession> getUserSessions(User user) {
        return chatSessionRepository.findByUserOrderByCreatedAtDesc(user);
    }
}
