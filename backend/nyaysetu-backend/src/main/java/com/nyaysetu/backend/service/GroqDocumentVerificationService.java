package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Groq AI Document Verification Service
 * Analyzes uploaded documents for:
 * - Document authenticity (proper format, signatures)
 * - Legal relevance (matches case type)
 * - Required fields present
 * - Matching case details
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GroqDocumentVerificationService {

    @Value("${groq.api.key:}")
    private String groqApiKey;
    
    @Value("${groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    /**
     * Analyze a document and return verification results
     */
    public DocumentVerificationResult verifyDocument(String documentContent, String documentName, 
                                                      String category, String caseTitle, String caseType) {
        if (groqApiKey == null || groqApiKey.isEmpty()) {
            log.warn("Groq API key not configured. Returning default verification.");
            return defaultVerification(documentName);
        }

        try {
            String prompt = buildVerificationPrompt(documentContent, documentName, category, caseTitle, caseType);
            String aiResponse = callGroqAPI(prompt);
            return parseVerificationResponse(aiResponse, documentName);
        } catch (Exception e) {
            log.error("Error verifying document: {}", e.getMessage());
            return defaultVerification(documentName);
        }
    }

    private String buildVerificationPrompt(String documentContent, String documentName, 
                                           String category, String caseTitle, String caseType) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a legal document verification AI. Analyze the following document and provide a verification report.\n\n");
        prompt.append("Document Name: ").append(documentName).append("\n");
        prompt.append("Category: ").append(category).append("\n");
        
        if (caseTitle != null && !caseTitle.isEmpty()) {
            prompt.append("Related Case Title: ").append(caseTitle).append("\n");
        }
        if (caseType != null && !caseType.isEmpty()) {
            prompt.append("Case Type: ").append(caseType).append("\n");
        }
        
        prompt.append("\nDocument Content (excerpt):\n");
        // Limit content to avoid token limits
        String limitedContent = documentContent.length() > 3000 
            ? documentContent.substring(0, 3000) + "..." 
            : documentContent;
        prompt.append(limitedContent);
        
        prompt.append("\n\nPlease analyze and respond in the following JSON format:\n");
        prompt.append("{\n");
        prompt.append("  \"verified\": true/false,\n");
        prompt.append("  \"confidenceScore\": 0-100,\n");
        prompt.append("  \"documentType\": \"detected document type\",\n");
        prompt.append("  \"authenticity\": { \"valid\": true/false, \"notes\": \"explanation\" },\n");
        prompt.append("  \"legalRelevance\": { \"relevant\": true/false, \"notes\": \"explanation\" },\n");
        prompt.append("  \"requiredFields\": { \"present\": true/false, \"missing\": [\"list of missing fields\"] },\n");
        prompt.append("  \"caseMatch\": { \"matches\": true/false, \"notes\": \"explanation\" },\n");
        prompt.append("  \"summary\": \"brief summary of verification\",\n");
        prompt.append("  \"recommendations\": [\"list of recommendations if any\"]\n");
        prompt.append("}\n");
        prompt.append("\nRespond ONLY with the JSON, no other text.");
        
        return prompt.toString();
    }

    private String callGroqAPI(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + groqApiKey);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", groqModel);
        requestBody.put("messages", List.of(message));
        requestBody.put("max_tokens", 1000);
        requestBody.put("temperature", 0.3); // Lower temperature for consistent results

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        ResponseEntity<String> response = restTemplate.exchange(
            GROQ_API_URL, HttpMethod.POST, entity, String.class
        );

        JsonNode root = objectMapper.readTree(response.getBody());
        return root.path("choices").get(0).path("message").path("content").asText();
    }

    private DocumentVerificationResult parseVerificationResponse(String aiResponse, String documentName) {
        try {
            // Clean up response - remove markdown code blocks if present
            String cleanedResponse = aiResponse
                .replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();
            
            JsonNode json = objectMapper.readTree(cleanedResponse);
            
            return DocumentVerificationResult.builder()
                .verified(json.path("verified").asBoolean(false))
                .confidenceScore(json.path("confidenceScore").asInt(50))
                .documentType(json.path("documentType").asText("Unknown"))
                .authenticityValid(json.path("authenticity").path("valid").asBoolean(false))
                .authenticityNotes(json.path("authenticity").path("notes").asText(""))
                .legallyRelevant(json.path("legalRelevance").path("relevant").asBoolean(false))
                .relevanceNotes(json.path("legalRelevance").path("notes").asText(""))
                .requiredFieldsPresent(json.path("requiredFields").path("present").asBoolean(false))
                .missingFields(extractStringList(json.path("requiredFields").path("missing")))
                .caseMatches(json.path("caseMatch").path("matches").asBoolean(true))
                .caseMatchNotes(json.path("caseMatch").path("notes").asText(""))
                .summary(json.path("summary").asText("Document analyzed"))
                .recommendations(extractStringList(json.path("recommendations")))
                .build();
                
        } catch (Exception e) {
            log.error("Error parsing AI response: {}", e.getMessage());
            return defaultVerification(documentName);
        }
    }

    private List<String> extractStringList(JsonNode arrayNode) {
        if (arrayNode == null || !arrayNode.isArray()) {
            return List.of();
        }
        return java.util.stream.StreamSupport.stream(arrayNode.spliterator(), false)
            .map(JsonNode::asText)
            .toList();
    }

    private DocumentVerificationResult defaultVerification(String documentName) {
        return DocumentVerificationResult.builder()
            .verified(false)
            .confidenceScore(0)
            .documentType("Unknown")
            .authenticityValid(false)
            .authenticityNotes("AI verification unavailable")
            .legallyRelevant(false)
            .relevanceNotes("Manual review required")
            .requiredFieldsPresent(false)
            .missingFields(List.of())
            .caseMatches(true)
            .caseMatchNotes("Not verified")
            .summary("Document uploaded but AI verification unavailable. Manual review required.")
            .recommendations(List.of("Configure Groq API key for automatic verification"))
            .build();
    }

    /**
     * Result object for document verification
     */
    @lombok.Data
    @lombok.Builder
    public static class DocumentVerificationResult {
        private boolean verified;
        private int confidenceScore;
        private String documentType;
        
        private boolean authenticityValid;
        private String authenticityNotes;
        
        private boolean legallyRelevant;
        private String relevanceNotes;
        
        private boolean requiredFieldsPresent;
        private List<String> missingFields;
        
        private boolean caseMatches;
        private String caseMatchNotes;
        
        private String summary;
        private List<String> recommendations;
        
        public String getStatus() {
            if (verified && confidenceScore >= 70) {
                return "VERIFIED";
            } else if (confidenceScore >= 50) {
                return "UNDER_REVIEW";
            } else {
                return "PENDING";
            }
        }
    }
}
