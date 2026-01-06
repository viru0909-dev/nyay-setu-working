package com.nyaysetu.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AiService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    public String summarize(String text) {
        try {
            String prompt = "Please provide a concise legal summary of the following text:\n\n" + text;
            return chat(prompt);
        } catch (Exception e) {
            log.error("Summarization error", e);
            return "Document summarization: " + text.substring(0, Math.min(100, text.length())) + "...";
        }
    }

    public String chat(String message) {
        log.info("AI Chat request with Groq. Key present: {}", groqApiKey != null && !groqApiKey.isEmpty());
        
        if (groqApiKey == null || groqApiKey.isEmpty()) {
            log.warn("No Groq API key found, using fallback responses");
            return getFallbackResponse(message);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            // Build Groq API request (OpenAI compatible)
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", groqModel);
            
            ArrayNode messagesArray = requestBody.putArray("messages");
            
            // System message
            ObjectNode systemMsg = messagesArray.addObject();
            systemMsg.put("role", "system");
            systemMsg.put("content", "You are a helpful AI legal assistant for NyaySetu, India's virtual judiciary platform. " +
                "Provide accurate, concise information about Indian law, the Constitution, legal procedures, and citizens' rights. " +
                "Keep responses professional and relatively brief. If specific legal advice is needed, remind users to consult a lawyer.");
            
            // User message
            ObjectNode userMsg = messagesArray.addObject();
            userMsg.put("role", "user");
            userMsg.put("content", message);

            requestBody.put("temperature", 0.7);

            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(GROQ_API_URL, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                String aiResponse = jsonResponse.path("choices").get(0)
                    .path("message").path("content").asText();
                
                log.info("Groq API response received successfully");
                return aiResponse;
            }
            
            return getFallbackResponse(message);
            
        } catch (Exception e) {
            log.error("Groq API error: {}", e.getMessage());
            return getFallbackResponse(message);
        }
    }

    public String analyzeDocument(String text, String fileName) {
        log.info("Analyzing document with Groq: {}", fileName);
        
        String prompt = "You are an expert Indian legal analyst. Analyze the following document and provide a structured JSON report.\n\n" +
                "Document Name: " + fileName + "\n" +
                "Document Content:\n" + (text.length() > 5000 ? text.substring(0, 5000) : text) + "\n\n" +
                "Please respond with ONLY a JSON object containing:\n" +
                "{\n" +
                "  \"summary\": \"concise legal summary\",\n" +
                "  \"legalPoints\": [\"key point 1\", \"key point 2\"], // MUST be a JSON array (list), even if only one item\n" +
                "  \"relevantLaws\": [\"IPC Section X\", \"CrPC Section Y\"], // MUST be a JSON array\n" +
                "  \"importantDates\": [\"2023-10-12: Filing date\"], // MUST be a JSON array\n" +
                "  \"partiesInvolved\": [\"Party A vs Party B\"], // MUST be a JSON array\n" +
                "  \"caseLawSuggestions\": [\"Case X vs Case Y (2010)\"], // MUST be a JSON array\n" +
                "  \"suggestedCategory\": \"CIVIL/CRIMINAL/FAMILY/etc\",\n" +
                "  \"riskAssessment\": \"Low/Medium/High with brief reasoning\"\n" +
                "}\n\n" +
                "Respond with valid JSON only. Do not add markdown backticks outside the JSON.";

        return chat(prompt);
    }

    private String getFallbackResponse(String message) {
        // Keyword-based intelligent responses for Indian legal system
        String lowerMessage = message.toLowerCase();
        
        if (lowerMessage.contains("constitution") || lowerMessage.contains("संविधान")) {
            return "The Indian Constitution is the supreme law of India. It was adopted on 26th November 1949 and came into effect on 26th January 1950. " +
                   "It contains 395 articles in 22 parts and 8 schedules. You can browse the Constitution using the Constitution Reader feature on our platform. " +
                   "What specific aspect would you like to know about?";
        } else if (lowerMessage.contains("file a case") || lowerMessage.contains("केस दर्ज")) {
            return "To file a case on NyaySetu:\n" +
                   "1. Create an account and log in\n" +
                   "2. Navigate to 'File Case' section\n" +
                   "3. Fill in case details (type, description, parties involved)\n" +
                   "4. Upload supporting documents\n" +
                   "5. Submit for review\n\n" +
                   "Would you like guidance on any specific step?";
        } else if (lowerMessage.contains("rights") || lowerMessage.contains("अधिकार")) {
            return "Indian citizens have several fundamental rights guaranteed by the Constitution:\n" +
                   "• Right to Equality (Articles 14-18)\n" +
                   "• Right to Freedom (Articles 19-22)\n" +
                   "• Right against Exploitation (Articles 23-24)\n" +
                   "• Right to Freedom of Religion (Articles 25-28)\n" +
                   "• Cultural and Educational Rights (Articles 29-30)\n" +
                   "• Right to Constitutional Remedies (Article 32)\n\n" +
                   "Which right would you like to learn more about?";
        } else if (lowerMessage.contains("lawyer") || lowerMessage.contains("वकील")) {
            return "You can find and connect with registered lawyers on NyaySetu:\n" +
                   "1. Browse the Lawyers Directory\n" +
                   "2. Filter by specialization, experience, and location\n" +
                   "3. View lawyer profiles and ratings\n" +
                   "4. Send consultation requests\n\n" +
                   "Would you like help finding a lawyer for a specific legal matter?";
        } else if (lowerMessage.contains("hearing") || lowerMessage.contains("सुनवाई")) {
            return "Virtual hearings on NyaySetu allow you to attend court proceedings remotely:\n" +
                   "• Access your case dashboard\n" +
                   "• Check scheduled hearings\n" +
                   "• Join via secure video conferencing\n" +
                   "• Submit documents digitally\n\n" +
                   "Do you need help with an upcoming hearing?";
        } else {
            return "I'm here to help with legal questions! I can assist you with:\n" +
                   "• Indian Constitution and laws\n" +
                   "• Filing cases online\n" +
                   "• Your legal rights\n" +
                   "• Finding lawyers\n" +
                   "• Virtual hearings\n" +
                   "• Document management\n\n" +
                   "Please ask me about any of these topics, and I'll be happy to help!";
        }
    }
}