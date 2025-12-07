package com.nyaysetu.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

@Service
public class AiService {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String summarize(String text) {
        return "Document summarization: " + text.substring(0, Math.min(100, text.length())) + "...";
    }

    public String chat(String message) {
        // Debug: Check if API key is loaded
        System.out.println("Gemini API Key loaded: " + (openaiApiKey != null && !openaiApiKey.isEmpty()));
        
        // If no Gemini key, use fallback
        if (openaiApiKey == null || openaiApiKey.isEmpty()) {
            System.out.println("No Gemini API key found, using fallback responses");
            return getFallbackResponse(message);
        }

        try {
            System.out.println("Calling Google Gemini API...");
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=" + openaiApiKey;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Build Gemini API request
            ObjectNode requestBody = objectMapper.createObjectNode();
            ArrayNode contents = requestBody.putArray("contents");
            ObjectNode content = contents.addObject();
            ArrayNode parts = content.putArray("parts");
            ObjectNode part = parts.addObject();
            
            // System instruction + user message
            String fullPrompt = "You are a helpful AI legal assistant for NyaySetu, India's virtual judiciary platform. " +
                "Provide accurate, concise information about Indian law, the Constitution, legal procedures, and citizens' rights. " +
                "Keep responses professional and under 200 words. If specific legal advice is needed, remind users to consult a lawyer.\n\n" +
                "User question: " + message;
            
            part.put("text", fullPrompt);

            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                String aiResponse = jsonResponse.path("candidates").get(0)
                    .path("content").path("parts").get(0).path("text").asText();
                
                System.out.println("Gemini API response received!");
                return aiResponse;
            }
            
            return getFallbackResponse(message);
            
        } catch (Exception e) {
            System.err.println("Gemini API error: " + e.getMessage());
            e.printStackTrace();
            return getFallbackResponse(message);
        }
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