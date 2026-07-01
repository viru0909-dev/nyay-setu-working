package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.networknt.schema.ValidationMessage;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Defensive wrapper around structured case-data produced for persistence.
 *
 * Flow: VakilFriendService.extractCaseData() does the existing best-effort
 * markdown/regex extraction from the chat transcript. Before that data is
 * ever written to CaseEntity/FirRecord, this service validates it against
 * the JSON Schema. If invalid, it runs a bounded self-repair loop against
 * Groq (temperature=0, explicit error feedback). If it still can't produce
 * a schema-valid payload after MAX_REPAIR_ATTEMPTS, it signals the caller
 * to require manual correction instead of writing bad data silently.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VakilFriendGroqValidatorService {

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final int MAX_REPAIR_ATTEMPTS = 2;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final GroqResponseValidator groqResponseValidator;

    @Getter
    @Builder
    public static class ValidatedCaseData {
        private final Map<String, String> data;
        private final boolean requiresManualInput;
        private final List<String> validationErrors;
    }

    public ValidatedCaseData validateAndRepair(Map<String, String> candidateData, String transcriptExcerpt) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            log.warn("⚠️ Groq API key missing; skipping schema validation/repair loop");
            return ValidatedCaseData.builder()
                    .data(candidateData)
                    .requiresManualInput(false)
                    .validationErrors(List.of())
                    .build();
        }

        ObjectNode candidateNode = toSchemaNode(candidateData);
        Set<ValidationMessage> errors = groqResponseValidator.validate(candidateNode);

        if (errors.isEmpty()) {
            return ValidatedCaseData.builder()
                    .data(candidateData)
                    .requiresManualInput(false)
                    .validationErrors(List.of())
                    .build();
        }

        log.warn("⚠️ Vakil-Friend case data failed schema validation: {}", errors);

        ObjectNode lastAttempt = candidateNode;
        Set<ValidationMessage> lastErrors = errors;

        for (int attempt = 1; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
            try {
                ObjectNode repaired = repairWithGroq(lastAttempt, lastErrors, transcriptExcerpt);
                Set<ValidationMessage> repairErrors = groqResponseValidator.validate(repaired);

                if (repairErrors.isEmpty()) {
                    log.info("✅ Vakil-Friend case data repaired on attempt {}", attempt);
                    return ValidatedCaseData.builder()
                            .data(toDataMap(repaired))
                            .requiresManualInput(false)
                            .validationErrors(List.of())
                            .build();
                }

                lastAttempt = repaired;
                lastErrors = repairErrors;
                log.warn("⚠️ Repair attempt {} still invalid: {}", attempt, repairErrors);
            } catch (Exception e) {
                log.error("❌ Repair attempt {} threw an exception", attempt, e);
            }
        }

        // Circuit breaker — never persist unvalidated data.
        return ValidatedCaseData.builder()
                .data(toDataMap(lastAttempt))
                .requiresManualInput(true)
                .validationErrors(lastErrors.stream().map(ValidationMessage::getMessage).collect(Collectors.toList()))
                .build();
    }

    private ObjectNode repairWithGroq(ObjectNode malformed, Set<ValidationMessage> errors, String transcriptExcerpt) throws Exception {
        String errorList = errors.stream().map(ValidationMessage::getMessage).collect(Collectors.joining("; "));

        String repairPrompt = """
            You previously extracted structured case-filing data that FAILED schema validation.

            Schema violations:
            %s

            Malformed payload:
            %s

            Original case conversation context (for reference):
            %s

            Return ONLY a corrected JSON object with EXACTLY these fields and nothing else:
            title (string), description (string),
            caseType (one of: CIVIL, CRIMINAL, FAMILY, PROPERTY, COMMERCIAL),
            petitioner (string), respondent (string),
            urgency (one of: NORMAL, URGENT, CRITICAL),
            target (one of: POLICE, COURT).
            No markdown, no explanation, no extra fields — just the JSON object.
            """.formatted(errorList, malformed.toString(), transcriptExcerpt);

        ArrayNode messages = objectMapper.createArrayNode();

        ObjectNode systemMsg = objectMapper.createObjectNode();
        systemMsg.put("role", "system");
        systemMsg.put("content", "You are a strict JSON repair engine for a legal case-filing system. You only output valid JSON matching the requested schema.");
        messages.add(systemMsg);

        ObjectNode userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", repairPrompt);
        messages.add(userMsg);

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", groqModel);
        requestBody.set("messages", messages);
        requestBody.put("temperature", 0);
        requestBody.put("max_tokens", 1024);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
        ResponseEntity<String> response = restTemplate.exchange(GROQ_API_URL, HttpMethod.POST, entity, String.class);

        JsonNode root = objectMapper.readTree(response.getBody());
        String content = root.path("choices").path(0).path("message").path("content").asText();
        String cleanJson = content.replace("```json", "").replace("```", "").trim();

        JsonNode parsed = objectMapper.readTree(cleanJson);
        if (!parsed.isObject()) {
            throw new IllegalStateException("Groq repair response was not a JSON object");
        }
        return (ObjectNode) parsed;
    }

    private ObjectNode toSchemaNode(Map<String, String> data) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("title", data.getOrDefault("title", ""));
        node.put("description", data.getOrDefault("description", ""));
        node.put("caseType", data.getOrDefault("caseType", ""));
        node.put("petitioner", data.getOrDefault("petitioner", ""));
        node.put("respondent", data.getOrDefault("respondent", ""));
        node.put("urgency", data.getOrDefault("urgency", ""));
        node.put("target", data.getOrDefault("target", ""));
        return node;
    }

    private Map<String, String> toDataMap(ObjectNode node) {
        Map<String, String> data = new HashMap<>();
        node.fieldNames().forEachRemaining(field -> data.put(field, node.path(field).asText("")));
        return data;
    }
}