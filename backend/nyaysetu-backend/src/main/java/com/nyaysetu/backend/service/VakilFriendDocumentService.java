package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nyaysetu.backend.dto.DocumentAnalysisResponse;
import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service for Vakil Friend AI Document Analysis.
 * Features:
 * - SHA-256 hash computation for document integrity
 * - AI-powered document analysis (validity, usefulness, type detection)
 * - Automatic storage to Evidence Vault for important documents
 * - Case Diary logging with cryptographic protection
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VakilFriendDocumentService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    @Value("${app.upload.evidence-path:uploads/evidence}")
    private String evidenceUploadPath;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final CaseEvidenceRepository evidenceRepository;
    private final VakilAiDiaryEntryRepository diaryRepository;
    private final CaseRepository caseRepository;
    private final CaseTimelineService timelineService;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    /**
     * Analyze a document uploaded to Vakil Friend AI.
     * Steps:
     * 1. Compute SHA-256 hash for integrity
     * 2. Extract document content (text)
     * 3. Send to AI for analysis
     * 4. Log to Case Diary with SHA-256 protection
     * 5. If important, store in Evidence Vault
     */
    @Transactional
    public DocumentAnalysisResponse analyzeDocument(
            UUID caseId,
            UUID sessionId,
            MultipartFile file,
            User user
    ) {
        log.info("🔍 Starting document analysis for case: {}, file: {}", caseId, file.getOriginalFilename());

        try {
            // 1. Compute SHA-256 hash
            String sha256Hash = computeSHA256(file.getBytes());
            log.info("📄 Document SHA-256: {}", sha256Hash);

            // 2. Save file temporarily and extract content
            String fileName = saveFile(file);
            String documentContent = extractTextContent(file);

            // 3. Get AI analysis
            Map<String, Object> aiAnalysis = callAIForDocumentAnalysis(
                    documentContent,
                    file.getOriginalFilename(),
                    caseId
            );

            // 4. Build response
            DocumentAnalysisResponse response = buildAnalysisResponse(
                    file.getOriginalFilename(),
                    sha256Hash,
                    aiAnalysis
            );

            // 5. Determine if document should be stored in vault
            boolean shouldStore = shouldStoreInVault(aiAnalysis);
            response.setRecommendStoreInVault(shouldStore);

            // 6. If important, store in Evidence Vault
            UUID evidenceId = null;
            if (shouldStore && caseId != null) {
                CaseEvidence evidence = storeInEvidenceVault(
                        caseId,
                        file,
                        fileName,
                        sha256Hash,
                        response,
                        user.getId()
                );
                evidenceId = evidence.getId();
                response.setStoredInVault(true);
                response.setVaultStorageId(evidenceId.toString());
                log.info("✅ Document stored in Evidence Vault: {}", evidenceId);
            }

            // 7. Log to Case Diary with SHA-256 protection
            VakilAiDiaryEntry diaryEntry = logToDiary(
                    caseId,
                    sessionId,
                    user.getId(),
                    "Uploaded and analyzed document: " + file.getOriginalFilename(),
                    formatAnalysisForDiary(response),
                    "DOCUMENT_ANALYSIS",
                    file.getOriginalFilename(),
                    sha256Hash
            );
            response.setDiaryEntryId(diaryEntry.getId());

            // 8. Add timeline event
            if (caseId != null) {
                String eventMessage = String.format(
                        "📄 AI Document Analysis: %s - %s (%s)",
                        file.getOriginalFilename(),
                        response.getValidityStatus(),
                        response.getUsefulnessLevel()
                );
                timelineService.addEvent(caseId, eventMessage);
            }

            response.setAnalysisTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            log.info("✅ Document analysis complete for: {}", file.getOriginalFilename());

            return response;

        } catch (Exception e) {
            log.error("❌ Document analysis failed: {}", e.getMessage(), e);
            throw new RuntimeException("Document analysis failed: " + e.getMessage(), e);
        }
    }

    /**
     * Compute SHA-256 hash of file bytes
     */
    public String computeSHA256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute SHA-256", e);
        }
    }

    /**
     * Compute SHA-256 hash of string content
     */
    public String computeSHA256(String content) {
        return computeSHA256(content.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Save file to upload directory
     */
    private String saveFile(MultipartFile file) {
        try {
            Path uploadDir = Paths.get(evidenceUploadPath).toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadDir.resolve(fileName);

            try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
                fos.write(file.getBytes());
            }

            return fileName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to save file", e);
        }
    }

    /**
     * Extract text content from document (simplified - handles text files primarily)
     */
    private String extractTextContent(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            byte[] bytes = file.getBytes();

            // For text-based files
            if (contentType != null && (
                    contentType.contains("text") ||
                    contentType.contains("json") ||
                    contentType.contains("xml") ||
                    contentType.contains("javascript")
            )) {
                return new String(bytes, StandardCharsets.UTF_8);
            }

            // For PDF and other formats, return a placeholder
            // In production, use Apache PDFBox or similar
            if (contentType != null && contentType.contains("pdf")) {
                return "[PDF Document: " + file.getOriginalFilename() + " - Content extraction requires PDF library]";
            }

            // For images, return metadata
            if (contentType != null && contentType.contains("image")) {
                return "[Image Document: " + file.getOriginalFilename() + " - Size: " + bytes.length + " bytes]";
            }

            // For Word documents
            if (contentType != null && (contentType.contains("word") || contentType.contains("document"))) {
                return "[Word Document: " + file.getOriginalFilename() + " - Content extraction requires POI library]";
            }

            // Default: try to read as text
            String content = new String(bytes, StandardCharsets.UTF_8);
            // Limit content for API
            if (content.length() > 10000) {
                content = content.substring(0, 10000) + "... [truncated]";
            }
            return content;

        } catch (Exception e) {
            return "[Unable to extract content from: " + file.getOriginalFilename() + "]";
        }
    }

    /**
     * Call Groq AI for document analysis
     */
    private Map<String, Object> callAIForDocumentAnalysis(
            String documentContent,
            String documentName,
            UUID caseId
    ) {
        try {
            String systemPrompt = buildDocumentAnalysisPrompt();
            String userPrompt = String.format(
                    "Analyze this document:\n\nDocument Name: %s\nCase ID: %s\n\nDocument Content:\n%s",
                    documentName,
                    caseId != null ? caseId.toString() : "N/A",
                    documentContent.length() > 5000 ? documentContent.substring(0, 5000) + "..." : documentContent
            );

            // Build messages
            ArrayNode messagesArray = objectMapper.createArrayNode();

            ObjectNode systemMsg = objectMapper.createObjectNode();
            systemMsg.put("role", "system");
            systemMsg.put("content", systemPrompt);
            messagesArray.add(systemMsg);

            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", userPrompt);
            messagesArray.add(userMsg);

            // Build request
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", groqModel);
            requestBody.set("messages", messagesArray);
            requestBody.put("temperature", 0.3);
            requestBody.put("max_tokens", 2048);

            // Call API
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
            String aiText = jsonResponse
                    .path("choices").path(0)
                    .path("message").path("content")
                    .asText();

            return parseAIAnalysisResponse(aiText);

        } catch (Exception e) {
            log.error("AI analysis failed, using fallback: {}", e.getMessage());
            return getDefaultAnalysis(documentName);
        }
    }

    /**
     * Build prompt for document analysis
     */
    private String buildDocumentAnalysisPrompt() {
        return """
            You are a legal document analysis AI for Nyay-Setu, India's digital judiciary platform.
            
            Analyze the uploaded document and provide a structured assessment in JSON format:
            
            {
                "documentType": "<type of document, e.g., 'Agreement', 'FIR Copy', 'Medical Certificate', 'Property Deed'>",
                "summary": "<brief 2-3 sentence summary of the document>",
                "language": "<detected language>",
                "validityStatus": "<VALID | INVALID | PARTIALLY_VALID | REQUIRES_REVIEW>",
                "validityReason": "<explanation of validity assessment>",
                "validityIssues": ["<list of any issues found>"],
                "usefulnessLevel": "<HIGH | MEDIUM | LOW | NOT_RELEVANT>",
                "usefulnessExplanation": "<why this document is useful or not for the case>",
                "keyPoints": ["<important points extracted from document>"],
                "recommendStoreInVault": <true if document is important evidence, false otherwise>,
                "recommendationReason": "<why storage is recommended or not>",
                "suggestedCategory": "<EVIDENCE | PETITION | IDENTITY | FINANCIAL | MEDICAL | PROPERTY | CONTRACT | OTHER>",
                "relevantLegalSections": ["<relevant IPC/CPC/CrPC sections if applicable>"],
                "potentialUses": ["<how this document could be used in the case>"]
            }
            
            Guidelines:
            1. Be thorough but concise in your analysis
            2. Flag any potential authenticity concerns
            3. Identify missing elements (signatures, dates, stamps)
            4. Consider Indian legal requirements for document validity
            5. Recommend vault storage for critical evidence
            
            Return ONLY valid JSON, no additional text.
            """;
    }

    /**
     * Parse AI response into structured map
     */
    private Map<String, Object> parseAIAnalysisResponse(String aiResponse) {
        try {
            // Try to extract JSON from response
            String jsonStr = aiResponse;
            if (aiResponse.contains("{")) {
                int start = aiResponse.indexOf("{");
                int end = aiResponse.lastIndexOf("}") + 1;
                jsonStr = aiResponse.substring(start, end);
            }

            return objectMapper.readValue(jsonStr, Map.class);
        } catch (Exception e) {
            log.warn("Failed to parse AI response as JSON, using text analysis");
            return extractFromTextResponse(aiResponse);
        }
    }

    /**
     * Extract analysis from text response when JSON parsing fails
     */
    private Map<String, Object> extractFromTextResponse(String response) {
        Map<String, Object> result = new HashMap<>();
        result.put("documentType", "General Document");
        result.put("summary", response.length() > 200 ? response.substring(0, 200) : response);
        result.put("language", "English");
        result.put("validityStatus", "REQUIRES_REVIEW");
        result.put("validityReason", "Manual review recommended");
        result.put("validityIssues", List.of("AI could not fully parse document"));
        result.put("usefulnessLevel", "MEDIUM");
        result.put("usefulnessExplanation", "Document needs manual assessment");
        result.put("keyPoints", List.of("Document uploaded for review"));
        result.put("recommendStoreInVault", true);
        result.put("recommendationReason", "Storage recommended for manual review");
        result.put("suggestedCategory", "OTHER");
        result.put("relevantLegalSections", List.of());
        result.put("potentialUses", List.of("Further analysis required"));
        return result;
    }

    /**
     * Default analysis when AI is unavailable
     */
    private Map<String, Object> getDefaultAnalysis(String documentName) {
        Map<String, Object> result = new HashMap<>();
        result.put("documentType", "Unknown");
        result.put("summary", "Document uploaded: " + documentName + ". AI analysis unavailable.");
        result.put("language", "Unknown");
        result.put("validityStatus", "REQUIRES_REVIEW");
        result.put("validityReason", "AI analysis service unavailable");
        result.put("validityIssues", List.of("Requires manual review"));
        result.put("usefulnessLevel", "MEDIUM");
        result.put("usefulnessExplanation", "Manual assessment needed");
        result.put("keyPoints", List.of("Document stored for review"));
        result.put("recommendStoreInVault", true);
        result.put("recommendationReason", "Default storage - requires review");
        result.put("suggestedCategory", "OTHER");
        result.put("relevantLegalSections", List.of());
        result.put("potentialUses", List.of());
        return result;
    }

    /**
     * Build response DTO from AI analysis
     */
    @SuppressWarnings("unchecked")
    private DocumentAnalysisResponse buildAnalysisResponse(
            String fileName,
            String sha256Hash,
            Map<String, Object> analysis
    ) {
        return DocumentAnalysisResponse.builder()
                .documentName(fileName)
                .sha256Hash(sha256Hash)
                .documentType((String) analysis.getOrDefault("documentType", "Unknown"))
                .summary((String) analysis.getOrDefault("summary", ""))
                .language((String) analysis.getOrDefault("language", "Unknown"))
                .validityStatus((String) analysis.getOrDefault("validityStatus", "REQUIRES_REVIEW"))
                .validityReason((String) analysis.getOrDefault("validityReason", ""))
                .validityIssues((List<String>) analysis.getOrDefault("validityIssues", List.of()))
                .usefulnessLevel((String) analysis.getOrDefault("usefulnessLevel", "MEDIUM"))
                .usefulnessExplanation((String) analysis.getOrDefault("usefulnessExplanation", ""))
                .keyPoints((List<String>) analysis.getOrDefault("keyPoints", List.of()))
                .recommendationReason((String) analysis.getOrDefault("recommendationReason", ""))
                .suggestedCategory((String) analysis.getOrDefault("suggestedCategory", "OTHER"))
                .relevantLegalSections((List<String>) analysis.getOrDefault("relevantLegalSections", List.of()))
                .potentialUses((List<String>) analysis.getOrDefault("potentialUses", List.of()))
                .build();
    }

    /**
     * Determine if document should be stored in vault based on AI analysis
     */
    private boolean shouldStoreInVault(Map<String, Object> analysis) {
        // Check explicit recommendation
        Object recommend = analysis.get("recommendStoreInVault");
        if (recommend instanceof Boolean) {
            return (Boolean) recommend;
        }

        // Check usefulness level
        String usefulness = (String) analysis.getOrDefault("usefulnessLevel", "MEDIUM");
        if ("HIGH".equals(usefulness)) return true;

        // Check validity - valid documents should be stored
        String validity = (String) analysis.getOrDefault("validityStatus", "REQUIRES_REVIEW");
        if ("VALID".equals(validity)) return true;

        // Check category - evidence should always be stored
        String category = (String) analysis.getOrDefault("suggestedCategory", "OTHER");
        if ("EVIDENCE".equals(category)) return true;

        return false;
    }

    /**
     * Store document in Evidence Vault with SHA-256 protection
     */
    @Transactional
    public CaseEvidence storeInEvidenceVault(
            UUID caseId,
            MultipartFile file,
            String savedFileName,
            String sha256Hash,
            DocumentAnalysisResponse analysis,
            Long uploaderId
    ) {
        CaseEvidence evidence = CaseEvidence.builder()
                .legalCaseId(caseId)
                .fileName(savedFileName)
                .fileUrl("/files/evidence/" + savedFileName)
                .uploadedBy(uploaderId)
                // SHA-256 Protection
                .sha256Hash(sha256Hash)
                .originalHash(sha256Hash)
                .hashVerified(true)
                .hashVerifiedAt(LocalDateTime.now())
                // AI Analysis
                .aiAnalysisSummary(analysis.getSummary())
                .documentType(analysis.getDocumentType())
                .validityStatus(analysis.getValidityStatus())
                .validityNotes(analysis.getValidityReason())
                .importance(analysis.getUsefulnessLevel())
                .category(analysis.getSuggestedCategory())
                .aiAnalyzed(true)
                .analyzedAt(LocalDateTime.now())
                // Vault Storage
                .storedInVault(true)
                .vaultStoredAt(LocalDateTime.now())
                .vaultStorageReason(analysis.getRecommendationReason())
                // Metadata
                .uploadedAt(LocalDateTime.now())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .build();

        return evidenceRepository.save(evidence);
    }

    /**
     * Log interaction to Case Diary with SHA-256 protection
     */
    @Transactional
    public VakilAiDiaryEntry logToDiary(
            UUID caseId,
            UUID sessionId,
            Long userId,
            String userQuery,
            String aiResponse,
            String entryType,
            String attachedDocName,
            String attachedDocHash
    ) {
        // Compute SHA-256 hash of the content for integrity
        String contentHash = computeSHA256(userQuery + "|" + aiResponse);

        VakilAiDiaryEntry entry = VakilAiDiaryEntry.builder()
                .caseId(caseId)
                .sessionId(sessionId)
                .userId(userId)
                .userQuery(userQuery)
                .aiResponse(aiResponse)
                .contentHash(contentHash)
                .entryType(entryType)
                .attachedDocumentName(attachedDocName)
                .attachedDocumentHash(attachedDocHash)
                .createdAt(LocalDateTime.now())
                .verified(true)
                .build();

        return diaryRepository.save(entry);
    }

    /**
     * Log a chat interaction to Case Diary
     */
    @Transactional
    public VakilAiDiaryEntry logChatToDiary(
            UUID caseId,
            UUID sessionId,
            Long userId,
            String userMessage,
            String aiMessage
    ) {
        return logToDiary(
                caseId,
                sessionId,
                userId,
                userMessage,
                aiMessage,
                "CHAT",
                null,
                null
        );
    }

    /**
     * Format analysis for diary entry
     */
    private String formatAnalysisForDiary(DocumentAnalysisResponse analysis) {
        StringBuilder sb = new StringBuilder();
        sb.append("## Document Analysis Report\n\n");
        sb.append("**Document:** ").append(analysis.getDocumentName()).append("\n");
        sb.append("**SHA-256:** ").append(analysis.getSha256Hash()).append("\n\n");
        sb.append("### Assessment\n");
        sb.append("- **Type:** ").append(analysis.getDocumentType()).append("\n");
        sb.append("- **Validity:** ").append(analysis.getValidityStatus()).append("\n");
        sb.append("- **Usefulness:** ").append(analysis.getUsefulnessLevel()).append("\n");
        sb.append("- **Category:** ").append(analysis.getSuggestedCategory()).append("\n\n");
        sb.append("### Summary\n").append(analysis.getSummary()).append("\n\n");

        if (analysis.getKeyPoints() != null && !analysis.getKeyPoints().isEmpty()) {
            sb.append("### Key Points\n");
            for (String point : analysis.getKeyPoints()) {
                sb.append("- ").append(point).append("\n");
            }
        }

        if (analysis.isStoredInVault()) {
            sb.append("\n✅ **Stored in Evidence Vault**\n");
        }

        return sb.toString();
    }

    /**
     * Get all diary entries for a case
     */
    public List<VakilAiDiaryEntry> getDiaryEntries(UUID caseId) {
        return diaryRepository.findByCaseIdOrderByCreatedAtDesc(caseId);
    }

    /**
     * Verify integrity of a diary entry
     */
    public boolean verifyDiaryEntryIntegrity(UUID entryId) {
        VakilAiDiaryEntry entry = diaryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Diary entry not found"));

        String expectedHash = computeSHA256(entry.getUserQuery() + "|" + entry.getAiResponse());
        return expectedHash.equals(entry.getContentHash());
    }

    /**
     * Verify integrity of evidence document
     */
    public boolean verifyEvidenceIntegrity(UUID evidenceId, byte[] currentFileBytes) {
        CaseEvidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new RuntimeException("Evidence not found"));

        String currentHash = computeSHA256(currentFileBytes);
        return currentHash.equals(evidence.getSha256Hash());
    }
    /**
     * Backfill diary entries from a conversation history (used when a case is newly created from a chat)
     */
    @Transactional
    public void backfillDiary(UUID caseId, UUID sessionId, Long userId, String conversationJson) {
        try {
            JsonNode root = objectMapper.readTree(conversationJson);
            if (!root.isArray()) return;

            String lastUserMsg = null;
            
            for (JsonNode node : root) {
                String role = node.path("role").asText();
                String content = node.path("content").asText();

                if ("user".equals(role)) {
                    lastUserMsg = content;
                } else if ("assistant".equals(role) && lastUserMsg != null) {
                    // We have a pair: User Query -> AI Response
                    logToDiary(
                            caseId,
                            sessionId,
                            userId,
                            lastUserMsg,
                            content,
                            "CHAT_HISTORY",
                            null,
                            null
                    );
                    lastUserMsg = null; // Reset
                }
            }
        } catch (Exception e) {
            log.error("Failed to backfill diary from conversation: {}", e.getMessage());
        }
    }
}
