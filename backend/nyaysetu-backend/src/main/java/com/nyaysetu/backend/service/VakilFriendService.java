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
import com.nyaysetu.backend.repository.DocumentRepository;
import com.nyaysetu.backend.entity.DocumentEntity;
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
import java.util.stream.Collectors;

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
    private final DocumentRepository documentRepository;
    private final OllamaService ollamaService;
    
    // Lazy injection to avoid circular dependency
    @Autowired
    @Lazy
    private CaseAssignmentService caseAssignmentService;

    // Groq API - Fast, free Llama models
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    private static final String SYSTEM_PROMPT = """
        You are Vakil-Friend, an intelligent and empathetic AI legal guide for Nyay-Setu, India's digital judiciary platform.
        
        YOUR GOAL:
        Help citizens file their legal cases by being both supportive and professional. You should acknowledge their situation, explain legal terms if they seem confused, and guide them through the 7-item checklist below.
        
        REQUIRED INFORMATION (Collect these to file the case):
        1. ISSUE: What happened? (Give a brief empathetic acknowledgment of their problem).
        2. CASE_TYPE: CIVIL, CRIMINAL, FAMILY, PROPERTY, or COMMERCIAL. (Explain these briefly if the user isn't sure).
        3. PETITIONER: Their full name.
        4. RESPONDENT: Who they are filing against.
        5. INCIDENT_DATE: When this occurred.
        6. EVIDENCE: A description of any physical or digital proof they possess.
        7. URGENCY: NORMAL, URGENT, or CRITICAL.
        
        FORMATTING RULES:
        - Use Markdown for all responses.
        - Use **bold** for emphasis and headers.
        - Use bullet points for lists.
        - Ensure clear spacing between paragraphs.
        - Be detailed and helpful. Acknowledge the user's input before moving to the next question.
        - If the user asks what a term means (e.g., "What is a Respondent?"), explain it clearly.
        - DO NOT provide final legal judgments, but DO provide procedural guidance.
        - Maintain a tone that is authoritative yet accessible.
        
        FINAL STEP:
        When all 7 items are collected, you MUST provide a standardized summary between three hashes (###) like this:
        
        ### CASE SUMMARY START ###
        - **Case Type**: [TYPE]
        - **Petitioner**: [NAME]
        - **Respondent**: [NAME]
        - **Issue**: [DESCRIPTION]
        - **Urgency**: [LEVEL]
        ### CASE SUMMARY END ###
        
        Then say: "Your case is ready to file! Click the 'Complete Filing' button to submit."
        """;

    /**
     * Start a new case assistance session with context
     */
    @Transactional
    public ChatSession startCaseAssistanceSession(User user, UUID caseId) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        String caseContext = buildCaseContext(caseEntity);
        
        List<Map<String, String>> conversation = new ArrayList<>();
        
        String systemPrompt = "You are an AI legal assistant helping with a specific case. " +
                "Here is the case context:\n" + caseContext + 
                "\n\nAnswer the user's questions based on this context.";

        if (user.getRole() == com.nyaysetu.backend.entity.Role.JUDGE || user.getRole() == com.nyaysetu.backend.entity.Role.SUPER_JUDGE) {
             systemPrompt += "\n\nROLE: You are a Judicial Assistant. Your goal is to be impartial, focus on facts, contradictions in evidence, and timeline analysis. Do not take sides. Provide objective summaries.";
        } else if (user.getRole() == com.nyaysetu.backend.entity.Role.LAWYER) {
             systemPrompt += "\n\nROLE: You are a Legal Associate. Your goal is to help the lawyer with case strategy, identify gaps in evidence, and suggest legal precedents. Be strategic and professional.";
        } else {
             systemPrompt += "\n\nROLE: You are a helpful assistant for the client. Explain legal terms simply and guide them through the process. Be empathetic.";
        }
        
        systemPrompt += "\nDo not ask for case details again. Be helpful and specific.";

        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);
        conversation.add(systemMsg);
        
        Map<String, String> aiMsg = new HashMap<>();
        aiMsg.put("role", "assistant");
        aiMsg.put("content", "I have reviewed your case details for **" + caseEntity.getTitle() + "**. How can I assist you with this case today?");
        conversation.add(aiMsg);

        try {
            ChatSession session = ChatSession.builder()
                .user(user)
                .status(ChatSessionStatus.ACTIVE)
                .conversationData(objectMapper.writeValueAsString(conversation))
                .caseEntity(caseEntity)
                .title("Assistance: " + caseEntity.getTitle())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            
            return chatSessionRepository.save(session);
        } catch (Exception e) {
            throw new RuntimeException("Failed to start session", e);
        }
    }

    private String buildCaseContext(CaseEntity caseEntity) {
        StringBuilder sb = new StringBuilder();
        sb.append("Case Title: ").append(caseEntity.getTitle()).append("\n");
        sb.append("Case Type: ").append(caseEntity.getCaseType()).append("\n");
        sb.append("Status: ").append(caseEntity.getStatus()).append("\n");
        sb.append("Description: ").append(caseEntity.getDescription()).append("\n");
        sb.append("Petitioner: ").append(caseEntity.getPetitioner()).append("\n");
        sb.append("Respondent: ").append(caseEntity.getRespondent()).append("\n");
        
        if (caseEntity.getNextHearing() != null) {
            sb.append("Next Hearing: ").append(caseEntity.getNextHearing()).append("\n");
        }
        if (caseEntity.getAssignedJudge() != null) {
            sb.append("Judge: ").append(caseEntity.getAssignedJudge()).append("\n");
        }
        
        // Evidence
        try {
            List<DocumentEntity> docs = documentRepository.findByCaseId(caseEntity.getId());
            if (!docs.isEmpty()) {
                sb.append("\nEvidence/Documents:\n");
                for (DocumentEntity doc : docs) {
                    sb.append("- ").append(doc.getFileName()).append(" (").append(doc.getCategory()).append(")\n");
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch documents for context", e);
        }
        
        // Hearings
        try {
            List<Hearing> hearings = hearingRepository.findByCaseEntityId(caseEntity.getId());
            if (hearings != null && !hearings.isEmpty()) {
                 sb.append("\nHearings History:\n");
                 for (Hearing h : hearings) {
                     sb.append("- ").append(h.getScheduledDate()).append(": ").append(h.getStatus()).append("\n");
                 }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch hearings for context", e);
        }
        
        return sb.toString();
    }

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
            
            // Generate title after first user message if not already set
            if (session.getTitle() == null || session.getTitle().isEmpty()) {
                session.setTitle(generateSessionTitle(conversation));
            }
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

        // AUTO-ASSIGN: DISABLED - Cases now go to Unassigned Pool for Judges to claim
        /*
        try {
            caseAssignmentService.autoAssignJudge(savedCase.getId());
            // Refresh the case to get the assigned judge
            savedCase = caseRepository.findById(savedCase.getId()).orElse(savedCase);
            log.info("✅ Auto-assigned judge to case {}: {}", savedCase.getId(), savedCase.getAssignedJudge());
        } catch (Exception e) {
            log.warn("Could not auto-assign judge to case {}: {}", savedCase.getId(), e.getMessage());
        }

        // AUTO-SCHEDULE: DISABLED - Judge will schedule after claiming
        try {
            savedCase = autoScheduleHearing(savedCase, caseData.get("urgency"));
            log.info("📅 Auto-scheduled hearing for case {}", savedCase.getId());
        } catch (Exception e) {
            log.warn("Could not auto-schedule hearing for case {}: {}", savedCase.getId(), e.getMessage());
        }
        */

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

    private String getAIResponse(List<Map<String, String>> conversation) {
        // Log key presence (safely)
        if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
            log.warn("⚠️ Groq API key is missing or empty. Falling back to scripted responses.");
        } else {
            try {
                String groqResponse = callGroqAPI(conversation);
                if (groqResponse != null && !groqResponse.trim().isEmpty()) {
                    log.info("✅ Groq AI response received successfully.");
                    return groqResponse;
                }
            } catch (Exception e) {
                log.error("❌ Groq API error: {}. Falling back to basic assistance.", e.getMessage());
            }
        }
        
        // Final fallback - only used if AI is offline
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
        requestBody.put("temperature", 0.5); // Increased for more natural, detailed responses
        requestBody.put("max_tokens", 2048);
        
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
        
        // Return a response that encourages the user while the AI service is restored
        return "I'm currently having a bit of trouble connecting to my central legal brain, but I'm still here to help! " +
               "Please provide the details of your case (what happened, who is involved, and any evidence you have). " +
               "Once our connection is stronger, I will summarize everything for you to file. " +
               "\n\n(Tip: Ensure your GROQ_API_KEY is active!)";
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
            String fullAiContent = aiText.toString();

            // 1. Primary Strategy: Look for the standardized summary block (most recent one)
            String summaryBlock = "";
            int startIdx = fullAiContent.lastIndexOf("### CASE SUMMARY START ###");
            int endIdx = fullAiContent.lastIndexOf("### CASE SUMMARY END ###");
            
            if (startIdx >= 0 && endIdx > startIdx) {
                summaryBlock = fullAiContent.substring(startIdx, endIdx);
                log.info("Found standardized summary block for extraction");
            } else {
                // Fallback: search for earlier version or any bold CASE SUMMARY
                int fallbackIdx = fullAiContent.lastIndexOf("**CASE SUMMARY**");
                if (fallbackIdx >= 0) {
                    summaryBlock = fullAiContent.substring(fallbackIdx, Math.min(fallbackIdx + 1000, fullAiContent.length()));
                    log.info("Found fallback summary block for extraction");
                }
            }

            // 2. Extract specific fields from the summary block (or full content if block missing)
            String sourceForExtraction = summaryBlock.isEmpty() ? fullAiContent : summaryBlock;
            
            String petitioner = extractAfterLabel(sourceForExtraction, "Petitioner:", "पेटिशनर:");
            if (!petitioner.isEmpty() && !petitioner.equalsIgnoreCase("[NAME]")) {
                caseData.put("petitioner", petitioner);
            }
            
            String respondent = extractAfterLabel(sourceForExtraction, "Respondent:", "रेस्पोंडेंट:");
            if (!respondent.isEmpty() && !respondent.equalsIgnoreCase("[NAME]")) {
                caseData.put("respondent", respondent);
            }
            
            String extractedType = extractAfterLabel(sourceForExtraction, "Case Type:", "मामले का प्रकार:");
            if (!extractedType.isEmpty() && !extractedType.equalsIgnoreCase("[TYPE]")) {
                String typeLower = extractedType.toLowerCase();
                if (typeLower.contains("criminal") || typeLower.contains("क्रिमिनल")) caseData.put("caseType", "CRIMINAL");
                else if (typeLower.contains("family") || typeLower.contains("फैमिली")) caseData.put("caseType", "FAMILY");
                else if (typeLower.contains("property") || typeLower.contains("प्रॉपर्टी")) caseData.put("caseType", "PROPERTY");
                else if (typeLower.contains("commercial") || typeLower.contains("कमर्शियल")) caseData.put("caseType", "COMMERCIAL");
                else caseData.put("caseType", "CIVIL");
            }

            String extractedUrgency = extractAfterLabel(sourceForExtraction, "Urgency:", "अर्जेंसी:", "महत्व:");
            if (!extractedUrgency.isEmpty() && !extractedUrgency.equalsIgnoreCase("[LEVEL]")) {
                String urgLower = extractedUrgency.toLowerCase();
                if (urgLower.contains("critical") || urgLower.contains("क्रिटिकल")) caseData.put("urgency", "CRITICAL");
                else if (urgLower.contains("urgent") || urgLower.contains("अर्जेंट")) caseData.put("urgency", "URGENT");
                else caseData.put("urgency", "NORMAL");
            }

            // 3. Fallback extraction from keywords if summary extraction failed
            if (!caseData.containsKey("caseType")) {
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
            }

            if (!caseData.containsKey("urgency")) {
                if (text.contains("critical") || text.contains("emergency") || text.contains("immediate")) {
                    caseData.put("urgency", "CRITICAL");
                } else if (text.contains("urgent") || text.contains("asap") || text.contains("soon")) {
                    caseData.put("urgency", "URGENT");
                } else {
                    caseData.put("urgency", "NORMAL");
                }
            }

            // 4. Generate professional title using specialized AI call
            String title = generateCaseTitle(sourceForExtraction.isEmpty() ? fullAiContent : sourceForExtraction, firstUserMessage);
            if (title != null && title.length() > 200) title = title.substring(0, 200);
            caseData.put("title", title != null ? title : "Case filed via Vakil-Friend");

            // Use first user message as description - TRUNCATE to 1000 chars
            String description = firstUserMessage;
            if (description.length() > 1000) {
                description = description.substring(0, 1000) + "...";
            }
            caseData.put("description", description);

            // Set mandatory defaults
            caseData.putIfAbsent("petitioner", "Petitioner");
            caseData.putIfAbsent("respondent", "Respondent");
            caseData.putIfAbsent("caseType", "CIVIL");
            caseData.putIfAbsent("urgency", "NORMAL");

            // Safety truncation
            caseData.entrySet().forEach(entry -> {
                String val = entry.getValue();
                if (val != null && val.length() > 2000 && !entry.getKey().equals("description")) {
                    entry.setValue(val.substring(0, 2000));
                }
            });

        } catch (Exception e) {
            log.error("Serious error extracting case data", e);
        }

        return caseData;
    }
    
    /**
     * Helper to extract text after a label (supports multiple label versions)
     */
    private String extractAfterLabel(String text, String... labels) {
        for (String label : labels) {
            // Flexible matching for labels with potential markdown bolding and colon variations
            // e.g., "**Petitioner**:", "**Petitioner:**", "Petitioner:"
            String cleanLabel = label.replace(":", "");
            String[] possiblePatterns = {
                "**" + cleanLabel + "**:",
                "**" + cleanLabel + ":**",
                cleanLabel + ":",
                "**" + cleanLabel + "**",
                cleanLabel
            };

            for (String pattern : possiblePatterns) {
                int idx = text.indexOf(pattern);
                if (idx >= 0) {
                    String after = text.substring(idx + pattern.length());
                    
                    // If the pattern didn't include a colon, check if the next char is a colon
                    if (!pattern.contains(":") && after.trim().startsWith(":")) {
                        after = after.trim().substring(1);
                    }
                    
                    int endIdx = after.indexOf("\n");
                    if (endIdx < 0) endIdx = Math.min(200, after.length());
                    
                    String extracted = after.substring(0, endIdx).trim();
                    // Clean up markdown markers
                    return extracted.replaceAll("\\*\\*", "").replaceAll("\\*", "").replace("[", "").replace("]", "").trim();
                }
            }
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
     * Generate a short, descriptive title for the chat session using AI
     */
    private String generateSessionTitle(List<Map<String, String>> conversation) {
        try {
            // Only use the first message from user and assistant
            List<Map<String, String>> shortConversation = new ArrayList<>();
            Map<String, String> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", "Generate a very short (3-5 words) title for this legal chat based on the user's issue. Return ONLY the title text, no quotes or metadata.");
            shortConversation.add(systemMsg);
            
            // Find first user message
            boolean hasUserMessage = false;
            for (Map<String, String> msg : conversation) {
                if ("user".equals(msg.get("role"))) {
                    shortConversation.add(msg);
                    hasUserMessage = true;
                    break;
                }
            }
            
            if (!hasUserMessage) {
                return null; // Don't generate title for empty sessions
            }
            
            String title = callGroqAPI(shortConversation);
            String trimmedTitle = (title != null && !title.trim().isEmpty()) ? title.trim() : "Legal Discussion";
            
            // Safety truncate to ensure it fits even if DB wasn't updated or for other constraints
            if (trimmedTitle.length() > 200) {
                trimmedTitle = trimmedTitle.substring(0, 197) + "...";
            }
            return trimmedTitle;
        } catch (Exception e) {
            return "New Legal Chat";
        }
    }

    /**
     * Generate a professional case title using AI
     */
    private String generateCaseTitle(String summaryText, String firstMessage) {
        try {
            // Clean the summary text to remove tags before sending to AI to avoid confusion
            String cleanedSummary = summaryText
                    .replace("### CASE SUMMARY START ###", "")
                    .replace("### CASE SUMMARY END ###", "")
                    .trim();

            List<Map<String, String>> prompt = new ArrayList<>();
            Map<String, String> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", "You are a professional legal registrar. Create a formal Indian court case title (e.g., '[Petitioner] vs. [Respondent] for [Key Issue]'). " +
                    "IMPORTANT: Return ONLY the plain text of the title. DO NOT include headers, hashtags, markdown bolding, or the word 'Title:'. " +
                    "Keep it under 12 words.");
            prompt.add(systemMsg);
            
            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", "Relevant Info: " + cleanedSummary + "\nUser Input: " + firstMessage);
            prompt.add(userMsg);
            
            String title = callGroqAPI(prompt);
            if (title == null || title.trim().isEmpty()) {
                return "Case filed via Vakil-Friend";
            }

            // Post-processing cleanup
            String cleanedTitle = title.trim()
                    .replaceAll("(?i)^Title:\\s*", "")
                    .replace("###", "")
                    .replace("**", "")
                    .replace("\"", "")
                    .trim();

            // Final safety check: if the AI still returned the full summary block (echoing)
            if (cleanedTitle.contains("Case Type:") || cleanedTitle.contains("Petitioner:")) {
                log.warn("AI echoed summary in title. Fallback to basic extraction.");
                String p = extractAfterLabel(cleanedTitle, "Petitioner:", "पेटिशनर:");
                String r = extractAfterLabel(cleanedTitle, "Respondent:", "रेस्पोंडेंट:");
                if (p.isEmpty()) p = "Petitioner";
                if (r.isEmpty()) r = "Respondent";
                return p + " vs. " + r;
            }

            return cleanedTitle;
        } catch (Exception e) {
            log.error("Title generation failed: {}", e.getMessage());
            return "Case: " + (firstMessage.length() > 50 ? firstMessage.substring(0, 50) + "..." : firstMessage);
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
        List<ChatSession> sessions = chatSessionRepository.findByUserOrderByCreatedAtDesc(user);
        
        // Filter out empty sessions (no user messages) to keep history clean
        return sessions.stream()
                .filter(session -> {
                    String data = session.getConversationData();
                    return data != null && data.contains("\"role\":\"user\"");
                })
                .collect(Collectors.toList());
    }
}
