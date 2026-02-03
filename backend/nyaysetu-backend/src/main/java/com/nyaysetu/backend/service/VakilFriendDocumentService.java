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
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
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

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final CaseEvidenceRepository evidenceRepository;
    private final VakilAiDiaryEntryRepository diaryRepository;
    private final CaseRepository caseRepository;
    private final CaseTimelineService timelineService;
    private final DocumentRepository documentRepository;
    private final DocumentAnalysisRepository documentAnalysisRepository;
    
    // Robust helper services from fix branch
    private final FileStorageService fileStorageService;
    private final PdfTextExtractorService pdfTextExtractorService;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    /**
     * Analyze a document uploaded to Vakil Friend AI.
     * Integrates robust file storage and PDF extraction.
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

            // 2. Save file using FileStorageService
            String savedFilePath = fileStorageService.storeFile(file, "VAKIL_FRIEND_TEMP");
            File storedFile = fileStorageService.getFile(savedFilePath);
            
            // 3. Extract content using PdfTextExtractorService or local logic
            String documentContent = extractDocumentText(storedFile, file.getContentType());

            // 4. Get AI analysis
            Map<String, Object> aiAnalysis = callAIForDocumentAnalysis(
                    documentContent,
                    file.getOriginalFilename(),
                    caseId
            );

            // 5. Build response
            DocumentAnalysisResponse response = buildAnalysisResponse(
                    file.getOriginalFilename(),
                    sha256Hash,
                    aiAnalysis
            );
            
            // Link stored file path
            response.setFileName(file.getOriginalFilename());

            // 6. If important, store in Evidence Vault (CaseEvidence table)
            boolean shouldStore = shouldStoreInVault(aiAnalysis);
            response.setRecommendStoreInVault(shouldStore);

            UUID evidenceId = null;
            if (shouldStore && caseId != null) {
                CaseEvidence evidence = storeInEvidenceVault(
                        caseId,
                        file,
                        savedFilePath,
                        sha256Hash,
                        response,
                        user.getId()
                );
                evidenceId = evidence.getId();
                response.setStoredInVault(true);
                response.setVaultStorageId(evidenceId.toString());
                log.info("✅ Document stored in Evidence Vault: {}", evidenceId);
            }

            // 6b. Always store as temp DocumentEntity for session tracking
            if (sessionId != null) {
               DocumentEntity doc = saveTempDocument(caseId, sessionId, savedFilePath, file, response, user);
               // Store the computed hash in the doc for the vault mirror later
               doc.setFileHash(sha256Hash);
               documentRepository.save(doc);
               
               // Also create DocumentAnalysis entity so 'AI Insights' button works in UI
               saveToDocumentAnalysis(doc, response, aiAnalysis);
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
            response.setDocumentId(diaryEntry.getId()); // Use diary entry ID as fallback doc ref

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
     * Alias for analyzeDocument to satisfy previous branch expectations.
     */
    @Transactional
    public DocumentAnalysisResponse uploadAndAnalyze(UUID sessionId, MultipartFile file) {
        // Find dummy user or current user context? 
        // In session upload, we might not have 'User' entity directly if called via a simplified path.
        // But the controller now provides it.
        throw new UnsupportedOperationException("Use analyzeDocument(null, sessionId, file, user) instead");
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
     * Robust text extraction using PDF library or direct reading
     */
    private String extractDocumentText(File storedFile, String contentType) {
        try {
            // 1. PDF Handling
            if (contentType != null && contentType.equalsIgnoreCase("application/pdf")) {
                return pdfTextExtractorService.extractText(storedFile);
            }

            // 2. Text/JSON Handling
            if (contentType != null && (contentType.contains("text") || contentType.contains("json"))) {
                return new String(Files.readAllBytes(storedFile.toPath()), StandardCharsets.UTF_8);
            }

            // 3. Fallback for others
            return "[Non-text document: " + contentType + "]";
        } catch (Exception e) {
            log.warn("Text extraction failed for {}: {}", storedFile.getName(), e.getMessage());
            return "[Text extraction failed]";
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
            
            // Limit content to avoid token overflow
            String contentToAnalyze = documentContent.length() > 6000 ? 
                    documentContent.substring(0, 6000) + "... [Truncated]" : documentContent;

            String userPrompt = String.format(
                    "Analyze this document:\n\nDocument Name: %s\nCase ID: %s\n\nDocument Content:\n%s",
                    documentName,
                    caseId != null ? caseId.toString() : "N/A",
                    contentToAnalyze
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
            requestBody.put("temperature", 0.1); // Lower temperature for more consistent JSON
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
            You are a legal document analysis AI for Nyay-Setu, India's digital judiciary platform (Digital India Mission).
            
            Analyze the uploaded document and provide a structured assessment in JSON format:
            
            {
                "documentType": "<type of document, e.g., 'Agreement', 'FIR Copy', 'Medical Certificate'>",
                "summary": "<brief 2-3 sentence summary clearly explaining what this document is>",
                "language": "<detected language>",
                "validityStatus": "<VALID | INVALID | REQUIRES_REVIEW>",
                "validityReason": "<why is it valid or not? Check for dates, stamps, signatures>",
                "validityIssues": ["<list specific issues like missing signature, expired date>"],
                "usefulnessLevel": "<HIGH | MEDIUM | LOW>",
                "usefulnessExplanation": "<how does this help as evidence for a legal case?>",
                "keyPoints": ["<bullet point list of important facts from the document>"],
                "recommendStoreInVault": <true if this document is critical evidence, false otherwise>,
                "suggestedCategory": "<EVIDENCE | PETITION | IDENTITY | FINANCIAL | CONTRACT>",
                "potentialUses": ["<how this document should be used in court>"]
            }
            
            Return ONLY valid JSON.
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
            log.warn("Failed to parse AI response as JSON, fallback to text");
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("summary", aiResponse);
            return fallback;
        }
    }

    /**
     * Default analysis when AI is unavailable
     */
    private Map<String, Object> getDefaultAnalysis(String documentName) {
        Map<String, Object> result = new HashMap<>();
        result.put("documentType", "Unknown");
        result.put("summary", "Document uploaded: " + documentName + ". Analysis failed.");
        result.put("validityStatus", "REQUIRES_REVIEW");
        result.put("usefulnessLevel", "MEDIUM");
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
                .suggestedCategory((String) analysis.getOrDefault("suggestedCategory", "OTHER"))
                .potentialUses((List<String>) analysis.getOrDefault("potentialUses", List.of()))
                .build();
    }

    /**
     * Determine if document should be stored in vault based on AI analysis
     */
    private boolean shouldStoreInVault(Map<String, Object> analysis) {
        String usefulness = (String) analysis.getOrDefault("usefulnessLevel", "MEDIUM");
        if ("HIGH".equals(usefulness)) return true;

        String validity = (String) analysis.getOrDefault("validityStatus", "REQUIRES_REVIEW");
        if ("VALID".equals(validity)) return true;

        return analysis.get("recommendStoreInVault") != null && (boolean) analysis.get("recommendStoreInVault");
    }

    /**
     * Store document in Evidence Vault (CaseEvidence table)
     */
    @Transactional
    public CaseEvidence storeInEvidenceVault(
            UUID caseId,
            MultipartFile file,
            String savedFilePath,
            String sha256Hash,
            DocumentAnalysisResponse analysis,
            Long uploaderId
    ) {
        CaseEvidence evidence = CaseEvidence.builder()
                .legalCaseId(caseId)
                .fileName(file.getOriginalFilename())
                .fileUrl("/api/documents/download?path=" + savedFilePath)
                .uploadedBy(uploaderId)
                .sha256Hash(sha256Hash)
                .originalHash(sha256Hash)
                .hashVerified(true)
                .hashVerifiedAt(LocalDateTime.now())
                .aiAnalysisSummary(analysis.getSummary())
                .documentType(analysis.getDocumentType())
                .validityStatus(analysis.getValidityStatus())
                .validityNotes(analysis.getValidityReason())
                .importance(analysis.getUsefulnessLevel())
                .category(analysis.getSuggestedCategory())
                .aiAnalyzed(true)
                .analyzedAt(LocalDateTime.now())
                .storedInVault(true)
                .vaultStoredAt(LocalDateTime.now())
                .uploadedAt(LocalDateTime.now())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .build();

        return evidenceRepository.save(evidence);
    }
    
    private DocumentEntity saveTempDocument(
            UUID caseId,
            UUID sessionId,
            String savedFilePath,
            MultipartFile file,
            DocumentAnalysisResponse analysis,
            User user
    ) {
         DocumentEntity doc = DocumentEntity.builder()
                .caseId(caseId) // Might be null initially
                .fileName(file.getOriginalFilename())
                .fileUrl(savedFilePath) 
                .contentType(file.getContentType())
                .size(file.getSize())
                .storageType(DocumentStorageType.LOCAL)
                .uploadedBy(user != null ? user.getId() : null)
                .category(caseId == null ? "VAKIL_FRIEND_TEMP" : "EVIDENCE")
                .description("SESSION:" + sessionId.toString() + " | AI Summary: " + analysis.getSummary())
                .isVerified(true)
                .build();
        
        return documentRepository.save(doc);
    }

    /**
     * Save to DocumentAnalysis entity so 'AI Insights' button works in UI
     */
    private void saveToDocumentAnalysis(DocumentEntity doc, DocumentAnalysisResponse response, Map<String, Object> rawAnalysis) {
        try {
            DocumentAnalysis analysis = DocumentAnalysis.builder()
                    .document(doc)
                    .summary(response.getSummary())
                    .suggestedCategory(response.getSuggestedCategory())
                    .analyzedAt(LocalDateTime.now())
                    .analysisSuccess(true)
                    .fullAnalysisJson(objectMapper.writeValueAsString(rawAnalysis))
                    // Map other fields if possible
                    .legalPoints(response.getKeyPoints() != null ? objectMapper.writeValueAsString(response.getKeyPoints()) : "[]")
                    .build();
            
            documentAnalysisRepository.save(analysis);
        } catch (Exception e) {
            log.warn("Failed to save DocumentAnalysis for doc {}: {}", doc.getId(), e.getMessage());
        }
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
        sb.append("**Assessment:** ").append(analysis.getValidityStatus()).append(" (").append(analysis.getUsefulnessLevel()).append(" usefulness)\n\n");
        sb.append("### Summary\n").append(analysis.getSummary()).append("\n\n");

        if (analysis.getKeyPoints() != null && !analysis.getKeyPoints().isEmpty()) {
            sb.append("### Key Points\n");
            for (String point : analysis.getKeyPoints()) {
                sb.append("- ").append(point).append("\n");
            }
        }
        return sb.toString();
    }

    /**
     * Backfill diary entries from a conversation history
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
                    logToDiary(caseId, sessionId, userId, lastUserMsg, content, "CHAT_HISTORY", null, null);
                    lastUserMsg = null;
                }
            }
        } catch (Exception e) {
            log.error("Failed to backfill diary: {}", e.getMessage());
        }
    }

    /**
     * Transfer temp documents to the actual case
     */
    @Transactional
    public void transferDocumentsToCase(UUID sessionId, UUID caseId) {
        log.info("Transferring documents for session {} to case {}", sessionId, caseId);
        
        var docs = documentRepository.findByCategoryAndDescriptionContaining(
            "VAKIL_FRIEND_TEMP", 
            "SESSION:" + sessionId.toString()
        );
        
        for (DocumentEntity doc : docs) {
            doc.setCaseId(caseId);
            doc.setCategory("EVIDENCE");
            doc.setDescription(doc.getDescription() + " | Linked to Case " + caseId);
            doc.setIsVerified(true);
            documentRepository.save(doc);

            // Also mirror to CaseEvidence table (Vault)
            try {
                CaseEvidence evidence = CaseEvidence.builder()
                        .legalCaseId(caseId)
                        .fileName(doc.getFileName())
                        .fileUrl(doc.getFileUrl())
                        .uploadedBy(doc.getUploadedBy())
                        .sha256Hash(doc.getFileHash()) // fileHash might be null here if not computed during init
                        .originalHash(doc.getFileHash())
                        .hashVerified(true)
                        .hashVerifiedAt(LocalDateTime.now())
                        .aiAnalysisSummary(doc.getDescription())
                        .category("EVIDENCE")
                        .aiAnalyzed(true)
                        .analyzedAt(LocalDateTime.now())
                        .storedInVault(true)
                        .vaultStoredAt(LocalDateTime.now())
                        .uploadedAt(LocalDateTime.now())
                        .fileSize(doc.getSize())
                        .mimeType(doc.getContentType())
                        .build();
                evidenceRepository.save(evidence);
            } catch (Exception e) {
                log.warn("Failed to create CaseEvidence mirror for doc {}: {}", doc.getId(), e.getMessage());
            }
        }
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
}
