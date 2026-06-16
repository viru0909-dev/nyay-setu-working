package com.nyaysetu.backend.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

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
        String docType = getStr(requestData, "docType");
        String petitionerName = getStr(requestData, "petitionerName");
        log.info("📝 Generating {} preview for {}", docType, petitionerName);

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

            String responseBody = response.getBody();
            if (HttpStatus.OK.equals(response.getStatusCode()) && responseBody != null) {
                JsonNode root = objectMapper.readTree(responseBody);
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
        } catch (org.springframework.web.client.RestClientException | java.io.IOException e) {
            log.error("❌ Document generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Document generation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Generate a document as PDF bytes.
     * Returns raw PDF bytes from LawGPT.
     */
    public byte[] generatePdf(Map<String, Object> requestData) {
        String docType = getStr(requestData, "docType");
        String petitionerName = getStr(requestData, "petitionerName");
        log.info("📄 Generating {} PDF for {}", docType, petitionerName);

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

            byte[] responseBody = response.getBody();
            if (HttpStatus.OK.equals(response.getStatusCode()) && responseBody != null) {
                log.info("✅ PDF generated successfully ({} bytes)", responseBody.length);
                return responseBody;
            }

            throw new RuntimeException("Unexpected response from LawGPT: " + response.getStatusCode());

        } catch (org.springframework.web.client.HttpServerErrorException e) {
            log.warn("⚠️ LawGPT service unavailable (503): {}", e.getMessage());
            throw new RuntimeException("Legal AI service unavailable. Please try again later.");
        } catch (org.springframework.web.client.RestClientException | java.io.IOException e) {
            log.error("❌ PDF generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Generate a document as DOCX bytes.
     */
    public byte[] generateDocx(Map<String, Object> requestData) {
        String docType = getStr(requestData, "docType");
        String petitionerName = getStr(requestData, "petitionerName");
        log.info("📄 Generating {} DOCX for {}", docType, petitionerName);

        try {
            ObjectNode pythonBody = buildPythonRequest(requestData);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(pythonBody), headers);

            ResponseEntity<byte[]> response = restTemplate.postForEntity(
                    lawgptUrl + "/generate/docx",
                    entity,
                    byte[].class
            );

            byte[] responseBody = response.getBody();
            if (HttpStatus.OK.equals(response.getStatusCode()) && responseBody != null) {
                log.info("✅ DOCX generated successfully ({} bytes)", responseBody.length);
                return responseBody;
            }

            throw new RuntimeException("Unexpected response from LawGPT: " + response.getStatusCode());

        } catch (org.springframework.web.client.HttpServerErrorException e) {
            log.warn("⚠️ LawGPT service unavailable (503): {}", e.getMessage());
            throw new RuntimeException("Legal AI service unavailable. Please try again later.");
        } catch (org.springframework.web.client.RestClientException | java.io.IOException e) {
            log.error("❌ DOCX generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("DOCX generation failed: " + e.getMessage(), e);
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
        root.put("language", getStr(requestData, "language"));

        ObjectNode fields = objectMapper.createObjectNode();
        fields.put("petitioner_name", getStr(requestData, "petitionerName"));
        fields.put("petitioner_address", getStr(requestData, "petitionerAddress"));
        fields.put("respondent_name", getStr(requestData, "respondentName"));
        fields.put("respondent_address", getStr(requestData, "respondentAddress"));
        fields.put("case_description", getStr(requestData, "caseDescription"));
        fields.put("incident_date", getStr(requestData, "incidentDate"));
        fields.put("relief_sought", getStr(requestData, "reliefSought"));
        fields.put("notice_period", getStr(requestData, "noticePeriod"));
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
