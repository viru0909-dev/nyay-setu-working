package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nyaysetu.backend.entity.ChatSession;
import com.nyaysetu.backend.entity.ChatSessionStatus;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.ChatSessionRepository;
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

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    /**
     * System prompts tailored for different roles
     */
    private static final Map<Role, String> ROLE_PROMPTS = Map.of(
        Role.CLIENT, """
            You are the NyaySetu AI Brain, a helpful legal guide for citizens.
            Your main goal is to help clients file cases, find lawyers, or understand legal rights.
            
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
            You are the NyaySetu Legal Strategist, an assistant for Advocates and Lawyers.
            Your goal is to increase legal efficiency and help draft high-quality documents.
            
            SPECIFIC TASKS:
            - DRAFTING: Draft messages to clients, written statements, or Rejoinders.
            - RESEARCH: Provide quick summaries of legal sections (IPC, BNS, CrPC, etc.).
            - CLIENT MGMT: Draft empathetic yet professional updates for clients.
            
            Tone: Strategic, professional, concise.
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

        // Get AI Response based on Role (Default to CLIENT for guest users)
        Role role = (user != null) ? user.getRole() : Role.CLIENT;
        String aiResponse = getAIResponse(conversation, role);

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

    private String getAIResponse(List<Map<String, String>> conversation, Role role) {
        if (groqApiKey != null && !groqApiKey.isEmpty()) {
            try {
                return callGroqAPI(conversation, role);
            } catch (Exception e) {
                log.error("Groq API error, falling back to local AI", e);
            }
        }
        
        // Fallback to Ollama
        try {
            String prompt = conversation.get(conversation.size() - 1).get("content");
            return ollamaService.chat(prompt).getResponse();
        } catch (Exception e) {
            return "BRAIN_OFFLINE: I'm currently having trouble connecting to my central reasoning core. Please try again in a moment.";
        }
    }

    private String callGroqAPI(List<Map<String, String>> conversation, Role role) throws Exception {
        ArrayNode messagesArray = objectMapper.createArrayNode();
        
        // System Prompt based on Role
        ObjectNode systemMsg = objectMapper.createObjectNode();
        systemMsg.put("role", "system");
        systemMsg.put("content", ROLE_PROMPTS.getOrDefault(role, "You are a helpful legal assistant for NyaySetu."));
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

    private List<Map<String, String>> parseConversation(String data) {
        try {
            if (data == null || data.isEmpty() || data.equals("[]")) return new ArrayList<>();
            return objectMapper.readValue(data, objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
