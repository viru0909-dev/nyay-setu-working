package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

/**
 * Service for AI-powered legal document generation.
 * 
 * Proxies requests to the Python LawGPT microservice which handles
 * FAISS retrieval + LLM drafting. This service handles:
 * - Field mapping (camelCase → snake_case for Python)
 * - PDF download proxying with SHA-256 hashing
 * - Error handling and graceful degradation
 */
@Service
@Slf4j
public class DocumentGenerationService {

    @Value("${lawgpt.service.url:http://localhost:8001}")
    private String lawgptUrl;

    private RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        // Longer timeouts for document generation (LLM calls take time)
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);   // 10 seconds connect
        factory.setReadTimeout(30000);      // 30 seconds read (generation is slow)
        this.restTemplate = new RestTemplate(factory);
        log.info("📝 DocumentGenerationService configured to use LawGPT at: {}", lawgptUrl);
    }

    /**
     * Generate a document preview (text only).
     * Returns the response JSON from LawGPT as a Map.
     */
    public Map<String, Object> generatePreview(Map<String, Object> requestData) {
        log.info("📝 Generating {} preview for {}", requestData.get("docType"), requestData.get("petitionerName"));

        try {
            // Build the Python request body with snake_case field names
            ObjectNode pythonBody = buildPythonRequest(requestData);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(pythonBody), headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    lawgptUrl + "/generate",
                    entity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                Map<String, Object> result = new LinkedHashMap<>();
                result.put("docType", root.path("doc_type").asText());
                result.put("title", root.path("title").asText());
                result.put("content", root.path("content").asText());
                result.put("sources", jsonArrayToList(root.path("sources")));
                result.put("generatedAt", root.path("generated_at").asText());
                log.info("✅ Document preview generated successfully");
                return result;
            }

            throw new RuntimeException("Unexpected response from LawGPT: " + response.getStatusCode());

        } catch (org.springframework.web.client.HttpServerErrorException e) {
            log.warn("⚠️ LawGPT service unavailable (503): {}", e.getMessage());
            throw new RuntimeException("Legal AI service unavailable. Please try again later.");
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Document generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Document generation failed: " + e.getMessage());
        }
    }

    /**
     * Generate a document as PDF bytes.
     * Returns raw PDF bytes from LawGPT.
     */
    public byte[] generatePdf(Map<String, Object> requestData) {
        log.info("📄 Generating {} PDF for {}", requestData.get("docType"), requestData.get("petitionerName"));

        try {
            ObjectNode pythonBody = buildPythonRequest(requestData);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(pythonBody), headers);

            ResponseEntity<byte[]> response = restTemplate.postForEntity(
                    lawgptUrl + "/generate/pdf",
                    entity,
                    byte[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("✅ PDF generated successfully ({} bytes)", response.getBody().length);
                return response.getBody();
            }

            throw new RuntimeException("Unexpected response from LawGPT: " + response.getStatusCode());

        } catch (org.springframework.web.client.HttpServerErrorException e) {
            log.warn("⚠️ LawGPT service unavailable (503): {}", e.getMessage());
            throw new RuntimeException("Legal AI service unavailable. Please try again later.");
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ PDF generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage());
        }
    }

    /**
     * Calculate SHA-256 hash of PDF bytes for document integrity verification.
     */
    public String calculateSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(data);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not available", e);
            throw new RuntimeException("Hash calculation failed", e);
        }
    }

    /**
     * Map camelCase frontend fields to the snake_case Python API format.
     */
    private ObjectNode buildPythonRequest(Map<String, Object> requestData) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("doc_type", (String) requestData.get("docType"));
        root.put("language", "en");

        ObjectNode fields = objectMapper.createObjectNode();
        fields.put("petitioner_name", getStr(requestData, "petitionerName"));
        fields.put("petitioner_address", getStr(requestData, "petitionerAddress"));
        fields.put("respondent_name", getStr(requestData, "respondentName"));
        fields.put("respondent_address", getStr(requestData, "respondentAddress"));
        fields.put("case_description", getStr(requestData, "caseDescription"));
        fields.put("incident_date", getStr(requestData, "incidentDate"));
        fields.put("relief_sought", getStr(requestData, "reliefSought"));
        fields.put("court_name", getStr(requestData, "courtName"));
        fields.put("department_name", getStr(requestData, "departmentName"));
        fields.put("pio_name", getStr(requestData, "pioName"));

        root.set("fields", fields);
        return root;
    }

    private String getStr(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : "";
    }

    private List<String> jsonArrayToList(JsonNode arrayNode) {
        List<String> list = new ArrayList<>();
        if (arrayNode != null && arrayNode.isArray()) {
            for (JsonNode item : arrayNode) {
                list.add(item.asText());
            }
        }
        return list;
    }
}
