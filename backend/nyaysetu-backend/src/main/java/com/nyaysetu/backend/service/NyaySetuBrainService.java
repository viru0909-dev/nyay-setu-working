package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nyaysetu.backend.entity.ChatSession;
import com.nyaysetu.backend.entity.ChatSessionStatus;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.ChatSessionRepository;
import com.nyaysetu.backend.repository.HearingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

/**
 * NyaySetu Central AI Brain Service
 * Uses Groq API (Llama 3.1) for advanced reasoning across the application.
 * Adapts personality and capabilities based on the user's role.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NyaySetuBrainService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ChatSessionRepository chatSessionRepository;
    private final OllamaService ollamaService;
    private final CaseRepository caseRepository;
    private final HearingRepository hearingRepository;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    /**
     * System prompts tailored for different roles
     */
    private static final Map<Role, String> ROLE_PROMPTS = Map.of(
        Role.LITIGANT, """
            You are the NyaySetu AI Brain, a helpful legal guide for citizens.
            Your main goal is to help litigants file cases, find lawyers, or understand legal rights.
            
            SPECIFIC TASKS:
            - CASE FILING: Collect Issue, Case Type, Parties, Dates, Evidence, Urgency (Ask one at a time).
            - LAWYER CONNECT: If asked to message a lawyer, ask for the message content and help DRAFT it professionally.
            - LEGAL RIGHTS: Explain laws (like IPC/BNS) in simple terms for laypeople.
            """,
        Role.JUDGE, """
            You are the NyaySetu Judicial Brain, an assistant for Honorable Judges.
            Your role is to analyze case dossiers, identify evidence gaps, and suggest procedural actions.
            
            SPECIFIC TASKS:
            - DOSSIER ANALYSIS: Summarize case facts and highlight key inconsistencies.
            - DECISION SUPPORT: Suggest if a case should be APPROVED or DISMISSED based on facts.
            - SCHEDULING: Suggest hearing dates based on urgency.
            
            Tone: Formal, precise, objective. Never make final decisions.
            """,
        Role.LAWYER, """
            You are the NyaySetu Legal Strategist, an intelligent assistant for Advocates.
            Your goal is to optimize the lawyer's workflow, manage their schedule, and provide case insights.
            
            CAPABILITIES:
            1. **Collision Detection**: ALWAYS check the provided hearing schedule before suggesting or accepting new dates. If a new date conflicts with an existing hearing, WARN the lawyer immediately.
            2. **Schedule Management**: You have access to the lawyer's upcoming busy days. Help them plan their day or week.
            3. **Case Strategy**: You know the details of their active cases. Provide summaries, drafting help, or strategy advice based on the specific case facts provided in the context.
            4. **Legal Research**: Provide sections from BNS/IPC relevant to their cases.
            
            Tone: Professional, strategic, and proactive.
            """
    );

    /**
     * Start/Resume a brain session
     */
    @Transactional
    public Map<String, Object> process(UUID sessionId, String userMessage, User user) {
        ChatSession session;
        if (sessionId == null) {
            session = ChatSession.builder()
                .user(user) // Can be null for guests
                .status(ChatSessionStatus.ACTIVE)
                .conversationData("[]")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            session = chatSessionRepository.save(session);
        } else {
            session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        }

        // Parse conversation
        List<Map<String, String>> conversation = parseConversation(session.getConversationData());
        
        // Add user message
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        conversation.add(userMsg);

        // Get AI Response based on Role (Default to LITIGANT for guest users)
        Role role = (user != null) ? user.getRole() : Role.LITIGANT;
        
        // Context Injection for Lawyers
        String dynamicContext = "";
        if (role == Role.LAWYER && user != null) {
            dynamicContext = getLawyerContext(user);
        }

        String aiResponse = getAIResponse(conversation, role, dynamicContext);

        // Add assistant message
        Map<String, String> assistantMsg = new HashMap<>();
        assistantMsg.put("role", "assistant");
        assistantMsg.put("content", aiResponse);
        conversation.add(assistantMsg);

        // Save session
        try {
            session.setConversationData(objectMapper.writeValueAsString(conversation));
            session.setUpdatedAt(LocalDateTime.now());
            chatSessionRepository.save(session);
        } catch (Exception e) {
            log.error("Failed to save conversation", e);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("message", aiResponse);
        response.put("role", role);
        
        return response;
    }

    private String getLawyerContext(User lawyer) {
        try {
            var cases = caseRepository.findByLawyer(lawyer);
            var hearings = hearingRepository.findByCaseEntityInOrderByScheduledDateDesc(cases);
            
            StringBuilder sb = new StringBuilder();
            sb.append("\n=== LAWYER CONTEXT ===\n");
            sb.append("Current Time: ").append(LocalDateTime.now()).append("\n");
            
            sb.append("\n-- UPCOMING SCHEDULE ANALYSIS --\n");
            if (hearings.isEmpty()) {
                sb.append("Schedule is clear. No upcoming hearings.\n");
            } else {
                Map<String, List<String>> scheduleMap = new HashMap<>();
                
                hearings.stream()
                        .filter(h -> h.getScheduledDate().isAfter(LocalDateTime.now()))
                        .forEach(h -> {
                            String dateKey = h.getScheduledDate().toLocalDate().toString();
                            String details = String.format("%s - %s (%s)", h.getScheduledDate().toLocalTime(), h.getStatus(), h.getCaseEntity().getTitle());
                            scheduleMap.computeIfAbsent(dateKey, k -> new ArrayList<>()).add(details);
                        });

                if (scheduleMap.isEmpty()) {
                     sb.append("No future hearings found.\n");
                } else {
                    scheduleMap.entrySet().stream()
                        .sorted(Map.Entry.comparingByKey())
                        .limit(10) // analyze next 10 busy days
                        .forEach(entry -> {
                            sb.append("DATE: ").append(entry.getKey());
                            if (entry.getValue().size() > 1) {
                                sb.append(" [⚠ BUSY - ").append(entry.getValue().size()).append(" HEARINGS]");
                            }
                            sb.append("\n");
                            entry.getValue().forEach(item -> sb.append("  - ").append(item).append("\n"));
                        });
                }
            }

            sb.append("\n-- ACTIVE CASES SNAPSHOT --\n");
            if (cases.isEmpty()) {
                sb.append("No active cases.\n");
            } else {
                cases.stream()
                     .limit(5) // Limit context window
                     .forEach(c -> sb.append(String.format("- [%s] %s: %s (Status: %s)\n",
                             c.getCaseType(), c.getTitle(), 
                             c.getDescription() != null ? c.getDescription().substring(0, Math.min(c.getDescription().length(), 100)) + "..." : "No desc", 
                             c.getStatus())));
            }
            sb.append("======================\n");
            return sb.toString();
        } catch (Exception e) {
            log.error("Error building lawyer context", e);
            return "";
        }
    }

    private String getAIResponse(List<Map<String, String>> conversation, Role role, String context) {
        if (groqApiKey != null && !groqApiKey.isEmpty()) {
            try {
                return callGroqAPI(conversation, role, context);
            } catch (Exception e) {
                log.error("Groq API error, falling back to local AI", e);
            }
        }
        
        // Fallback to Ollama
        try {
            String prompt = (context.isEmpty() ? "" : context + "\n\n") + conversation.get(conversation.size() - 1).get("content");
            return ollamaService.chat(prompt).getResponse();
        } catch (Exception e) {
            return "BRAIN_OFFLINE: I'm currently having trouble connecting to my central reasoning core. Please try again in a moment.";
        }
    }

    private String callGroqAPI(List<Map<String, String>> conversation, Role role, String context) throws Exception {
        ArrayNode messagesArray = objectMapper.createArrayNode();
        
        // System Prompt based on Role + Context
        ObjectNode systemMsg = objectMapper.createObjectNode();
        systemMsg.put("role", "system");
        
        String basePrompt = ROLE_PROMPTS.getOrDefault(role, "You are a helpful legal assistant for NyaySetu.");
        if (!context.isEmpty()) {
            basePrompt += "\n\n" + context;
        }
        
        systemMsg.put("content", basePrompt);
        messagesArray.add(systemMsg);
        
        // Context
        for (Map<String, String> msg : conversation) {
            ObjectNode msgNode = objectMapper.createObjectNode();
            msgNode.put("role", msg.get("role"));
            msgNode.put("content", msg.get("content"));
            messagesArray.add(msgNode);
        }

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", groqModel);
        requestBody.set("messages", messagesArray);
        requestBody.put("temperature", 0.6);
        requestBody.put("max_tokens", 2048);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
        
        ResponseEntity<String> response = restTemplate.exchange(GROQ_API_URL, HttpMethod.POST, entity, String.class);
        JsonNode jsonResponse = objectMapper.readTree(response.getBody());
        
        return jsonResponse.path("choices").path(0).path("message").path("content").asText();
    }

    private static final String CLASSIFICATION_SYSTEM_PROMPT = """
        You are a legal classification AI for NyaySetu. 
        Analyze the user's situation and determine if they should file a Police FIR or a Court Case.
        
        Rules:
        - Theft, Assault, Cybercrime, Lost Items, Accidents -> FIR (Police)
        - Property disputes, Divorce, Contracts, Civil matters -> CASE (Court)
        
        Return ONLY valid JSON with this structure:
        {
          "type": "FIR" or "CASE",
          "caseType": "CRIMINAL" or "CIVIL" or "FAMILY" or "PROPERTY" or "COMMERCIAL",
          "title": "A short professional title for the filing",
          "description": "A refined, professional description of the incident based on user input",
          "reason": "One sentence explaining why this classification was chosen"
        }
        Do not output markdown code blocks. Just the raw JSON string.
        """;

    public Map<String, String> analyzeCaseIntent(String userQuery) {
        if (groqApiKey != null && !groqApiKey.isEmpty()) {
            try {
                ArrayNode messagesArray = objectMapper.createArrayNode();
                
                ObjectNode systemMsg = objectMapper.createObjectNode();
                systemMsg.put("role", "system");
                systemMsg.put("content", CLASSIFICATION_SYSTEM_PROMPT);
                messagesArray.add(systemMsg);
                
                ObjectNode userMsg = objectMapper.createObjectNode();
                userMsg.put("role", "user");
                userMsg.put("content", userQuery);
                messagesArray.add(userMsg);

                ObjectNode requestBody = objectMapper.createObjectNode();
                requestBody.put("model", groqModel);
                requestBody.set("messages", messagesArray);
                requestBody.put("temperature", 0.3); // Lower temperature for consistent JSON
                requestBody.put("response_format", objectMapper.createObjectNode().put("type", "json_object")); // Force JSON if supported by model

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(groqApiKey);

                HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
                
                ResponseEntity<String> response = restTemplate.exchange(GROQ_API_URL, HttpMethod.POST, entity, String.class);
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                
                String content = jsonResponse.path("choices").path(0).path("message").path("content").asText();
                return objectMapper.readValue(content, Map.class);
                
            } catch (Exception e) {
                log.error("Groq Analysis Failed", e);
            }
        }
        
        // Fallback for demo/offline
        Map<String, String> fallback = new HashMap<>();
        boolean isCriminal = userQuery.toLowerCase().contains("theft") || userQuery.toLowerCase().contains("police");
        fallback.put("type", isCriminal ? "FIR" : "CASE");
        fallback.put("caseType", isCriminal ? "CRIMINAL" : "CIVIL");
        fallback.put("title", isCriminal ? "Incident Report" : "Legal Dispute");
        fallback.put("description", userQuery);
        fallback.put("reason", "Based on keywords (Offline Fallback)");
        return fallback;
    }

    private List<Map<String, String>> parseConversation(String data) {
        try {
            if (data == null || data.isEmpty() || data.equals("[]")) return new ArrayList<>();
            return objectMapper.readValue(data, objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
