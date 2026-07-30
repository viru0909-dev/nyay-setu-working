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

    /** Placeholder returned to callers that only care about the context text. */
    public static final String NO_CONTEXT_PLACEHOLDER = "No specific legal context found.";

    @Value("${lawgpt.service.url:http://localhost:8001}")
    private String lawgptUrl;

    private RestTemplate restTemplate;

    /**
     * Why a retrieval produced no usable legal context.
     *
     * <p>Callers must be able to tell "the corpus has nothing on this" apart from
     * "the retrieval service never answered" — an answer built on the second case
     * has no grounding at all and must not carry section numbers or citations.
     */
    public enum RetrievalStatus {
        /** LawGPT answered and returned usable legal context. */
        GROUNDED,
        /** LawGPT answered, but has nothing relevant for this query. */
        NO_MATCH,
        /** LawGPT could not be reached, timed out, or returned an error status. */
        UNAVAILABLE
    }

    /**
     * Retrieved legal context together with the outcome of the retrieval attempt.
     */
    public record RagContext(String context, RetrievalStatus status) {

        public static RagContext grounded(String context) {
            return new RagContext(context, RetrievalStatus.GROUNDED);
        }

        public static RagContext noMatch() {
            return new RagContext(NO_CONTEXT_PLACEHOLDER, RetrievalStatus.NO_MATCH);
        }

        public static RagContext unavailable() {
            return new RagContext(NO_CONTEXT_PLACEHOLDER, RetrievalStatus.UNAVAILABLE);
        }

        /** True only when a verified legal corpus actually backed this answer. */
        public boolean isGrounded() {
            return status == RetrievalStatus.GROUNDED;
        }
    }

    @PostConstruct
    public void init() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(factory);
        log.info("🔗 RagService configured to use LawGPT at: {}", lawgptUrl);
    }

    /**
     * Query the LawGPT RAG service for legal context backing a user question.
     *
     * <p>Never throws: an unreachable LawGPT service yields
     * {@link RetrievalStatus#UNAVAILABLE} so the caller can degrade safely
     * instead of letting the LLM answer from memory alone.
     */
    public RagContext retrieveContext(String query, int maxResults) {
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
                Object context = response.getBody().get("context");
                if (context instanceof String text && !text.isBlank()
                        && !NO_CONTEXT_PLACEHOLDER.equals(text.trim())) {
                    log.info("✅ RAG context retrieved from LawGPT service");
                    return RagContext.grounded(text);
                }
                log.info("ℹ️ LawGPT returned no legal context for this query");
                return RagContext.noMatch();
            }

            log.warn("⚠️ LawGPT service returned {}, treating context as unavailable",
                    response.getStatusCode());
        } catch (Exception e) {
            log.warn("⚠️ LawGPT service unavailable, answering without legal context: {}", e.getMessage());
        }
        return RagContext.unavailable();
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
