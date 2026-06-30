package com.nyaysetu.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import jakarta.annotation.PostConstruct;
import java.nio.file.Path;
import java.util.Map;

@Service
@Slf4j
public class RagService {

    @Value("${lawgpt.service.url:http://localhost:8001}")
    private String lawgptUrl;

    private RestTemplate restTemplate;

    @PostConstruct
    public void init() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(factory);
        log.info("🔗 RagService configured to use LawGPT at: {}", lawgptUrl);
    }

    public String findRelevantContext(String query, int maxResults) {
        log.info("🔍 Querying LawGPT RAG service for: '{}'", query);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                "question", query,
                "max_results", maxResults
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                lawgptUrl + "/context",
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String context = (String) response.getBody().get("context");
                log.info("✅ RAG context retrieved from LawGPT service");
                return context != null ? context : "No specific legal context found.";
            }
        } catch (Exception e) {
            log.warn("⚠️ LawGPT service unavailable, falling back to empty context: {}", e.getMessage());
        }
        return "No specific legal context found.";
    }

    public java.util.List<java.util.Map<String, Object>> searchPrecedents(String query, int maxResults) {
        log.info("🔍 Performing semantic search over legal precedents for: '{}'", query);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            java.util.Map<String, Object> body = java.util.Map.of(
                "query", query,
                "k", maxResults
            );

            HttpEntity<java.util.Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<java.util.List> response = restTemplate.postForEntity(
                lawgptUrl + "/search",
                request,
                java.util.List.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("✅ Semantic search results retrieved successfully from LawGPT");
                return (java.util.List<java.util.Map<String, Object>>) response.getBody();
            }
        } catch (Exception e) {
            log.warn("⚠️ LawGPT search endpoint failed: {}", e.getMessage());
        }
        return java.util.Collections.emptyList();
    }

    public void ingestDocument(Path filePath) {
        log.info("ℹ️ Ingestion delegated to LawGPT Python service");
    }

    public void ingestText(String text, String sourceName) {
        log.info("ℹ️ Ingestion delegated to LawGPT Python service");
    }
}
