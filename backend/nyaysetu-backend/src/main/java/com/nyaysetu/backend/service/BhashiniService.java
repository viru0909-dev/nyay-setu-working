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

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Translate text from source language to target language
     */
    public String translate(String text, String sourceLang, String targetLang) {
        if (text == null || text.trim().isEmpty()) return "";
        if (sourceLang.equalsIgnoreCase(targetLang)) return text;

        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("⚠️ Bhashini API Key missing. Returning mock translation.");
            return "[Mock Translation to " + targetLang + "]: " + text;
        }

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
            return root.path("pipelineResponse")
                    .path(0)
                    .path("output")
                    .path(0)
                    .path("target")
                    .asText();

        } catch (Exception e) {
            log.error("Failed to translate via Bhashini", e);
            // Fallback: return original text to avoid blocking flow
            return text;
        }
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
}
