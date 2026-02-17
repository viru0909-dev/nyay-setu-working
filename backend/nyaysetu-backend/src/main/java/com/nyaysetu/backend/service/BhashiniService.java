package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

/**
 * Service for Bhashini (National Language Translation Mission) Integration.
 * Handles Translation (IndicTrans2) and ASR (Speech-to-Text).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BhashiniService {

    @Value("${bhashini.api.key:}")
    private String apiKey;

    @Value("${bhashini.user.id:}")
    private String userId;

    @Value("${bhashini.url:https://dhruva-api.bhashini.gov.in/services/inference/pipeline}")
    private String apiUrl;

    @Value("${bhashini.pipeline.id:}") // User needs to configure this based on their Bhashini account
    private String pipelineId;
    
    // Groq API configuration for fallback translation
    @Value("${groq.api.key:}")
    private String groqApiKey;
    
    @Value("${groq.model:llama-3.1-8b-instant}")
    private String groqModel;
    
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Translate text from source language to target language
     */
    public String translate(String text, String sourceLang, String targetLang) {
        if (text == null || text.trim().isEmpty()) return "";
        if (sourceLang.equalsIgnoreCase(targetLang)) return text;

        // Skip Bhashini if API key is not configured - will use Groq fallback
        if (apiKey == null || apiKey.isEmpty()) {
            log.info("⚠️ Bhashini API Key not configured, will use Groq AI fallback");
        }

        // Try Bhashini first (only if API key is configured)
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                // Construct Bhashini Payload
                ObjectNode requestBody = objectMapper.createObjectNode();
                
                ObjectNode pipelineTasks = objectMapper.createObjectNode();
                pipelineTasks.put("taskType", "translation");
                
                ObjectNode config = objectMapper.createObjectNode();
                ObjectNode language = objectMapper.createObjectNode();
                language.put("sourceLanguage", sourceLang);
                language.put("targetLanguage", targetLang);
                config.set("language", language);
                pipelineTasks.set("config", config);

                ArrayNode inputData = objectMapper.createArrayNode();
                ObjectNode inputItem = objectMapper.createObjectNode();
                inputItem.put("source", text);
                inputData.add(inputItem);
                
                ArrayNode pipelineTasksArray = objectMapper.createArrayNode();
                pipelineTasksArray.add(pipelineTasks);
                
                requestBody.set("pipelineTasks", pipelineTasksArray);
                requestBody.set("inputData", inputData);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Authorization", apiKey);
                headers.set("x-user-id", userId);

                HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
                
                ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
                
                JsonNode root = objectMapper.readTree(response.getBody());
                String bhashiniTranslation = root.path("pipelineResponse")
                        .path(0)
                        .path("output")
                        .path(0)
                        .path("target")
                        .asText();
                
                if (bhashiniTranslation != null && !bhashiniTranslation.isEmpty()) {
                    log.info("✅ Bhashini translation successful");
                    return bhashiniTranslation;
                }
            } catch (Exception e) {
                log.error("Failed to translate via Bhashini: {}", e.getMessage());
            }
        }
        
        
        // Try Groq AI fallback
        try {
            log.info("📡 Attempting Groq AI fallback for translation: {} → {}", sourceLang, targetLang);
            String groqTranslation = translateViaGroq(text, sourceLang, targetLang);
            if (groqTranslation != null && !groqTranslation.isEmpty()) {
                log.info("✅ Groq translation successful");
                return groqTranslation;
            }
        } catch (Exception groqError) {
            log.error("❌ Groq translation also failed: {}", groqError.getMessage());
        }
        
        // Final fallback: return original text to avoid blocking flow
        log.warn("⚠️ All translation methods failed, returning original text");
        return text;
    }

    /**
     * Convert Speech to Text (ASR)
     * @param audioBase64 Base64 encoded audio string
     * @param sourceLang The language code of the speech (e.g., "hi", "mr")
     * @return Transcribed text
     */
    public String speechToText(String audioBase64, String sourceLang) {
        if (audioBase64 == null || audioBase64.isEmpty()) return "";

        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("⚠️ Bhashini API Key missing. Returning mock ASR.");
            return "This is a mock transcription of the audio.";
        }

        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            
            ObjectNode pipelineTasks = objectMapper.createObjectNode();
            pipelineTasks.put("taskType", "asr");
            
            ObjectNode config = objectMapper.createObjectNode();
            ObjectNode language = objectMapper.createObjectNode();
            language.put("sourceLanguage", sourceLang);
            config.set("language", language);
            pipelineTasks.set("config", config);
            
            ArrayNode inputData = objectMapper.createArrayNode();
            ObjectNode inputItem = objectMapper.createObjectNode();
            inputItem.put("audioContent", audioBase64);
            inputData.add(inputItem);

            ArrayNode pipelineTasksArray = objectMapper.createArrayNode();
            pipelineTasksArray.add(pipelineTasks);
            requestBody.set("pipelineTasks", pipelineTasksArray);
            requestBody.set("inputData", inputData);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", apiKey);
            
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
            
            JsonNode root = objectMapper.readTree(response.getBody());
             return root.path("pipelineResponse")
                    .path(0)
                    .path("output")
                    .path(0)
                    .path("source")
                    .asText();
                    
        } catch (Exception e) {
            log.error("Failed to perform ASR via Bhashini", e);
            return ""; 
        }
    }
    
    /**
     * Translate text using Groq AI (fallback when Bhashini is unavailable)
     * @param text Text to translate
     * @param sourceLang Source language code (e.g., "en", "hi")
     * @param targetLang Target language code (e.g., "en", "hi")
     * @return Translated text
     */
    private String translateViaGroq(String text, String sourceLang, String targetLang) throws Exception {
        if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
            throw new Exception("Groq API key not configured");
        }
        
        // Language name mapping for better prompts
        String sourceLangName = getLanguageName(sourceLang);
        String targetLangName = getLanguageName(targetLang);
        
        // Build translation request
        ArrayNode messagesArray = objectMapper.createArrayNode();
        
        // System message
        ObjectNode systemMsg = objectMapper.createObjectNode();
        systemMsg.put("role", "system");
        systemMsg.put("content", "You are a professional translator. Translate text accurately while preserving the meaning and tone. Return ONLY the translated text, nothing else.");
        messagesArray.add(systemMsg);
        
        // User message with translation request
        ObjectNode userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", String.format(
            "Translate the following text from %s to %s. Return ONLY the translation:\n\n%s",
            sourceLangName, targetLangName, text
        ));
        messagesArray.add(userMsg);
        
        // Build request body
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", groqModel);
        requestBody.set("messages", messagesArray);
        requestBody.put("temperature", 0.3); // Lower temperature for more consistent translation
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
        String translatedText = jsonResponse
                .path("choices").path(0)
                .path("message").path("content")
                .asText();
        
        return translatedText.trim();
    }
    
    /**
     * Get human-readable language name from code
     */
    private String getLanguageName(String langCode) {
        switch (langCode.toLowerCase()) {
            case "en": return "English";
            case "hi": return "Hindi";
            case "mr": return "Marathi";
            case "ta": return "Tamil";
            case "te": return "Telugu";
            case "gu": return "Gujarati";
            case "kn": return "Kannada";
            case "bn": return "Bengali";
            case "ml": return "Malayalam";
            case "pa": return "Punjabi";
            default: return langCode;
        }
    }
}
