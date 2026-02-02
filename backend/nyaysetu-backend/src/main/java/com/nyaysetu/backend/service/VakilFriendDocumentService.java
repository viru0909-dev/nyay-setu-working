package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nyaysetu.backend.dto.DocumentAnalysisResponse;
import com.nyaysetu.backend.entity.ChatSession;
import com.nyaysetu.backend.entity.DocumentEntity;
import com.nyaysetu.backend.entity.DocumentStorageType;
import com.nyaysetu.backend.repository.ChatSessionRepository;
import com.nyaysetu.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VakilFriendDocumentService {

    private final FileStorageService fileStorageService;
    private final PdfTextExtractorService pdfTextExtractorService;
    private final AiService aiService;
    private final DocumentRepository documentRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ObjectMapper objectMapper;

    /**
     * Upload and analyze a document for Vakil Friend Chat
     */
    @Transactional
    public DocumentAnalysisResponse uploadAndAnalyze(UUID sessionId, MultipartFile file) {
        log.info("Processing document upload for session: {}", sessionId);

        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        // 1. Store File
        String filePath = fileStorageService.storeFile(file, "VAKIL_FRIEND_TEMP");
        File storedFile = fileStorageService.getFile(filePath);

        // 2. Extract Text
        String extractedText = "";
        try {
            if (file.getContentType() != null && file.getContentType().equalsIgnoreCase("application/pdf")) {
                extractedText = pdfTextExtractorService.extractText(storedFile);
            } else {
                // Determine if text file? Or just read bytes?
                // For now, simple byte read for text files, or skip for images
                if (file.getContentType() != null && file.getContentType().startsWith("text/")) {
                    extractedText = new String(java.nio.file.Files.readAllBytes(storedFile.toPath()));
                } else {
                    extractedText = "[Non-text content or Image - verification required]";
                }
            }
        } catch (Exception e) {
            log.warn("Failed to extract text from file: {}", file.getOriginalFilename(), e);
            extractedText = "[Text extraction failed]";
        }

        // 3. Analyze with AI
        String analysisJson = aiService.analyzeDocument(extractedText, file.getOriginalFilename());
        
        // Parse JSON to get summary (simplistic)
        String summary = "";
        try {
            // AiService returns a JSON string, try to parse it
            Map<String, Object> analysisMap = objectMapper.readValue(analysisJson, Map.class);
            if (analysisMap.containsKey("summary")) {
                summary = (String) analysisMap.get("summary");
            } else {
                summary = analysisJson; // Fallback
            }
        } catch (Exception e) {
            summary = "Document analyzed. (Raw output unavailable)";
        }

        // 4. Save Metadata (Temporarily linked via description)
        DocumentEntity doc = DocumentEntity.builder()
                .fileName(file.getOriginalFilename())
                .fileUrl(filePath)
                .contentType(file.getContentType())
                .size(file.getSize())
                .storageType(DocumentStorageType.LOCAL)
                .category("VAKIL_FRIEND_TEMP")
                .description("SESSION:" + sessionId.toString() + " | Analysis: " + summary)
                .isVerified(false) // Not yet in Evidence Vault
                .build();
        
        doc = documentRepository.save(doc);

        return DocumentAnalysisResponse.builder()
                .documentId(doc.getId())
                .fileName(doc.getFileName())
                .summary(summary)
                .extractedText(extractedText.length() > 500 ? extractedText.substring(0, 500) + "..." : extractedText)
                .analysisJson(analysisJson)
                .build();
    }

    /**
     * Transfer temp documents to the actual case
     */
    @Transactional
    public void transferDocumentsToCase(UUID sessionId, UUID caseId) {
        log.info("Transferring documents for session {} to case {}", sessionId, caseId);
        
        // Find documents tagged with this session
        var docs = documentRepository.findByCategoryAndDescriptionContaining(
            "VAKIL_FRIEND_TEMP", 
            "SESSION:" + sessionId.toString()
        );
        
        log.info("Found {} documents to transfer", docs.size());
        
        for (DocumentEntity doc : docs) {
            doc.setCaseId(caseId);
            doc.setCategory("EVIDENCE");
            // Keep the description but maybe append connected info
            doc.setDescription(doc.getDescription() + " | Linked to Case " + caseId);
            doc.setIsVerified(true); // Assuming AI verified it enough to be filed
            documentRepository.save(doc);
        }
    }
}
