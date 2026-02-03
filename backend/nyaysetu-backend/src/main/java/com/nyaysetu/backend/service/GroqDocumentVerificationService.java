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

    /**
     * General chat with AI - for judge case assistant
     */
    public String chatWithAI(String prompt) {
        if (groqApiKey == null || groqApiKey.isEmpty()) {
            log.warn("Groq API key not configured");
            return "AI service not configured. Please configure Groq API key.";
        }
        
        try {
            return callGroqAPI(prompt);
        } catch (Exception e) {
            log.error("Error in AI chat: {}", e.getMessage());
            return "I'm sorry, I couldn't process your request. Please try again.";
        }
    }

    /**
     * Generate an investigation summary for the Police Dashboard
     */
    public String generateInvestigationSummary(String firDetails, String evidenceList) {
        String prompt = String.format("""
            You are a senior police investigator assistant. Summarize the following FIR and Evidence for an ongoing investigation.
            Focus on key facts, missing links, and recommended next steps.
            
            FIR Details:
            %s
            
            Evidence:
            %s
            
            Keep the summary concise (under 200 words) and actionable.
            """, firDetails, evidenceList);
            
        return chatWithAI(prompt);
    }

    /**
     * Draft a formal court submission (Case Diary / Charge Sheet)
     */
    public String generateCourtSubmission(String firDetails, String investigationFindings, String evidenceList) {
        String prompt = String.format("""
            You are a legal assistant for the Police Department. Draft a formal "Final Report" (Charge Sheet) for submission to the Magistrate/Judge.
            
            Case Context:
            %s
            
            Investigation Findings:
            %s
            
            Evidence Collected:
            %s
            
            Format the output with:
            1. Title: FINAL REPORT U/S 173 CrPC
            2. Brief Facts of the Case
            3. Investigation Details
            4. List of Evidence & Witnesses
            5. Conclusion / Prayer
            
            Use formal legal language suitable for Indian Courts.
            """, firDetails, investigationFindings, evidenceList);
            
        return chatWithAI(prompt);
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
        
        prompt.append("\n\nCRITICAL CHECK: Section 63(4) BSA Certificate Compliance\n");
        prompt.append("Check if this document contains or is accompanied by a Section 63(4) BSA Certificate metadata.\n");
        prompt.append("Specifically look for:\n");
        prompt.append("1. User ID / Uploader ID\n");
        prompt.append("2. IP Address / Source Device Details\n");
        prompt.append("3. Digital Hash / Checksum (SHA-256)\n");
        prompt.append("If these are missing, flag as PROCEDURAL ERROR.\n");
        
        prompt.append("\n\nPlease analyze and respond in the following JSON format:\n");
        prompt.append("{\n");
        prompt.append("  \"verified\": true/false,\n");
        prompt.append("  \"confidenceScore\": 0-100,\n");
        prompt.append("  \"documentType\": \"detected document type\",\n");
        prompt.append("  \"authenticity\": { \"valid\": true/false, \"notes\": \"explanation\" },\n");
        prompt.append("  \"bsaCompliance\": { \"compliant\": true/false, \"missingMetadata\": [\"User ID\", \"IP\", \"Hash\"] },\n");
        prompt.append("  \"legalRelevance\": { \"relevant\": true/false, \"notes\": \"explanation\" },\n");
        prompt.append("  \"requiredFields\": { \"present\": true/false, \"missing\": [\"list of missing fields\"] },\n");
        prompt.append("  \"caseMatch\": { \"matches\": true/false, \"notes\": \"explanation\" },\n");
        prompt.append("  \"summary\": \"brief summary of verification\",\n");
        prompt.append("  \"recommendations\": [\"list of recommendations if any\"]\n");
        prompt.append("}\n");
        prompt.append("\nRespond ONLY with the JSON, no other text.");
        
        return prompt.toString();
    }

    /**
     * Validate BSA Section 63(4) compliance for digital evidence.
     * Checks for mandatory metadata:
     * 1. Device Logs (origin device identification)
     * 2. User ID (person who captured/created the digital evidence)
     * 3. SHA-256 Hash (integrity verification)
     * 
     * @param documentContent The content/text of the document to validate
     * @param documentName Name of the document for reference
     * @return ValidationResult with compliance status and any blocking errors
     */
    public com.nyaysetu.backend.dto.ValidationResult validateBSA634Compliance(
            String documentContent, String documentName) {
        
        if (groqApiKey == null || groqApiKey.isEmpty()) {
            log.warn("Groq API key not configured. Returning default validation.");
            return com.nyaysetu.backend.dto.ValidationResult.builder()
                    .compliant(false)
                    .blockingError("Groq API not configured - cannot validate BSA 63(4) compliance")
                    .suggestion("Configure Groq API key in application properties")
                    .build();
        }

        try {
            String prompt = buildBSA634ValidationPrompt(documentContent, documentName);
            String aiResponse = callGroqAPI(prompt);
            return parseBSA634Response(aiResponse);
        } catch (Exception e) {
            log.error("Error validating BSA 63(4) compliance: {}", e.getMessage());
            return com.nyaysetu.backend.dto.ValidationResult.builder()
                    .compliant(false)
                    .blockingError("Validation failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Build the prompt for BSA 63(4) validation
     */
    private String buildBSA634ValidationPrompt(String documentContent, String documentName) {
        return String.format("""
            You are a legal compliance validator for the Indian Bharatiya Sakshya Act (BSA) 2023.
            
            Your task is to verify if this DIGITAL EVIDENCE document complies with Section 63(4) requirements.
            
            Section 63(4) BSA 2023 MANDATORY REQUIREMENTS for digital evidence admissibility:
            1. DEVICE LOGS: Information about the device that created/captured the evidence
            2. USER ID: Identification of the person responsible for the digital record
            3. SHA-256 HASH: Cryptographic hash for integrity verification
            
            Document Name: %s
            
            Document Content:
            ---
            %s
            ---
            
            Analyze the document and determine if it contains or references:
            1. Device logs or device identification (e.g., IMEI, device serial, IP address, device name)
            2. User identification (e.g., user ID, username, authenticated user, creator name)
            3. SHA-256 or similar cryptographic hash for data integrity
            
            Respond ONLY with a JSON object in this exact format:
            {
                "compliant": true/false,
                "hasDeviceLogs": true/false,
                "hasUserId": true/false,
                "hasSHA256Hash": true/false,
                "missingFields": ["Device Logs", "User ID", "SHA-256 Hash"],
                "details": "Explanation of what was found or missing",
                "suggestion": "How to fix compliance issues if any",
                "confidence": 0.0-1.0
            }
            
            Be strict - if any of the three requirements is clearly missing, the document is NOT compliant.
            """, documentName, documentContent != null ? documentContent.substring(0, Math.min(documentContent.length(), 3000)) : "No content");
    }

    /**
     * Parse Groq response for BSA 63(4) validation
     */
    private com.nyaysetu.backend.dto.ValidationResult parseBSA634Response(String aiResponse) {
        try {
            // Clean the response (remove markdown code blocks if present)
            String cleanResponse = aiResponse.trim();
            if (cleanResponse.startsWith("```json")) {
                cleanResponse = cleanResponse.substring(7);
            }
            if (cleanResponse.startsWith("```")) {
                cleanResponse = cleanResponse.substring(3);
            }
            if (cleanResponse.endsWith("```")) {
                cleanResponse = cleanResponse.substring(0, cleanResponse.length() - 3);
            }
            cleanResponse = cleanResponse.trim();

            JsonNode json = objectMapper.readTree(cleanResponse);
            
            boolean compliant = json.has("compliant") && json.get("compliant").asBoolean();
            boolean hasDeviceLogs = json.has("hasDeviceLogs") && json.get("hasDeviceLogs").asBoolean();
            boolean hasUserId = json.has("hasUserId") && json.get("hasUserId").asBoolean();
            boolean hasSHA256 = json.has("hasSHA256Hash") && json.get("hasSHA256Hash").asBoolean();
            
            java.util.List<String> missingFields = new java.util.ArrayList<>();
            if (!hasDeviceLogs) missingFields.add("Device Logs");
            if (!hasUserId) missingFields.add("User ID");
            if (!hasSHA256) missingFields.add("SHA-256 Hash");
            
            String details = json.has("details") ? json.get("details").asText() : "";
            String suggestion = json.has("suggestion") ? json.get("suggestion").asText() : "";
            double confidence = json.has("confidence") ? json.get("confidence").asDouble() : 0.5;
            
            if (!compliant || !missingFields.isEmpty()) {
                return com.nyaysetu.backend.dto.ValidationResult.blockingFailure(missingFields, suggestion);
            }
            
            return com.nyaysetu.backend.dto.ValidationResult.builder()
                    .compliant(true)
                    .details(details)
                    .confidence(confidence)
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to parse BSA 63(4) validation response: {}", e.getMessage());
            return com.nyaysetu.backend.dto.ValidationResult.builder()
                    .compliant(false)
                    .blockingError("Failed to parse validation response")
                    .build();
        }
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
                .bsaCompliant(json.path("bsaCompliance").path("compliant").asBoolean(false))
                .bsaMissingMetadata(extractStringList(json.path("bsaCompliance").path("missingMetadata")))
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

    /**
     * Generate a Judge's Brief (Digital Court Master) for a case
     */
    public String generateCaseBrief(com.nyaysetu.backend.entity.CaseEntity caseEntity) {
        String prompt = String.format("""
            You are a "Digital Court Master" (AI Judicial Assistant) for the High Court.
            Your task is to provide a concise, structured pre-hearing briefing for the Judge for the following case:
            
            Case Details:
            Title: %s
            Type: %s
            Petitioner: %s
            Respondent: %s
            Description: %s
            
            Please provide a summary in the following plain text format (Do NOT use markdown like **bold**):
            
            CASE SYNOPSIS
            (A 2-3 sentence overview of what the case is about)
            
            KEY LEGAL ISSUES
            (Bulleted list of potential legal questions or conflicts)
            
            PROCEDURAL STATUS
            (Current stage and what is expected next)
            
            SUGGESTED ACTIONS
            (1-2 recommended questions or actions for the judge)
            
            Keep the tone formal, judicial, and objective. Do not use asterisks or colons in the headers.
            """, 
            caseEntity.getTitle(),
            caseEntity.getCaseType(),
            caseEntity.getPetitioner(),
            caseEntity.getRespondent(),
            caseEntity.getDescription()
        );
        
        String response = chatWithAI(prompt);
        // Aggressively remove markdown symbols if AI ignored the instruction
        return response.replaceAll("\\*\\*", "")
                      .replaceAll("##", "")
                      .replaceAll("#", "")
                      .trim();
    }

    private DocumentVerificationResult defaultVerification(String documentName) {
        return DocumentVerificationResult.builder()
            .verified(false)
            .confidenceScore(0)
            .documentType("Unknown")
            .authenticityValid(false)
            .authenticityNotes("AI verification unavailable")
            .bsaCompliant(false)
            .bsaMissingMetadata(List.of("Verification Failed"))
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
        
        private boolean bsaCompliant;
        private List<String> bsaMissingMetadata;
        
        private boolean legallyRelevant;
        private String relevanceNotes;
        
        private boolean requiredFieldsPresent;
        private List<String> missingFields;
        
        private boolean caseMatches;
        private String caseMatchNotes;
        
        private String summary;
        private List<String> recommendations;
        
        public String getStatus() {
            if (verified && confidenceScore >= 70 && bsaCompliant) {
                return "VERIFIED";
            } else if (!bsaCompliant) {
                return "PROCEDURAL_ERROR";
            } else if (confidenceScore >= 50) {
                return "UNDER_REVIEW";
            } else {
                return "PENDING";
            }
        }
    }
}
