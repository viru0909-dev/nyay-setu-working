package com.nyaysetu.backend.service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.nyaysetu.backend.entity.DocumentAnalysis;
import com.nyaysetu.backend.entity.DocumentEntity;
import com.nyaysetu.backend.repository.DocumentAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentAnalysisService {
    
    private final PdfTextExtractorService pdfExtractor;
    private final GeminiAIService geminiService;
    private final DocumentAnalysisRepository analysisRepository;
    private final Gson gson = new Gson();
    
    /**
     * Analyze document asynchronously
     */
    @Async
    public void analyzeDocumentAsync(DocumentEntity document, File file) {
        log.info("Starting async analysis for document: {}", document.getId());
        
        // Skip if analysis already exists
        if (analysisRepository.existsByDocumentId(document.getId())) {
            log.info("Analysis already exists for document {}, skipping", document.getId());
            return;
        }
        
        try {
            // Check if PDF
            if (!pdfExtractor.isPdf(document.getFileName())) {
                log.warn("Document {} is not a PDF, skipping analysis", document.getId());
                saveFailedAnalysis(document, "Only PDF files can be analyzed");
                return;
            }
            
            // Extract text
            String text = pdfExtractor.extractText(file);
            
            if (text.trim().isEmpty()) {
                log.warn("No text extracted from PDF: {}", document.getId());
                saveFailedAnalysis(document, "No text content found in PDF");
                return;
            }
            
            // Get AI analysis
            String aiResponse = geminiService.analyzeDocument(text, document.getFileName());
            
            // Parse and save
            DocumentAnalysis analysis = parseAndSaveAnalysis(document, aiResponse);
            
            log.info("Document {} analyzed successfully", document.getId());
            
        } catch (Exception e) {
            log.error("Analysis failed for document {}", document.getId(), e);
            saveFailedAnalysis(document, e.getMessage());
        }
    }
    
    /**
     * Get analysis for a document
     */
    public DocumentAnalysis getAnalysisByDocumentId(UUID documentId) {
        return analysisRepository.findByDocumentId(documentId)
            .orElseThrow(() -> new RuntimeException("Analysis not found for document: " + documentId));
    }
    
    /**
     * Check if document has been analyzed
     */
    public boolean hasAnalysis(UUID documentId) {
        return analysisRepository.existsByDocumentId(documentId);
    }
    
    /**
     * Parse AI response and save to database
     */
    private DocumentAnalysis parseAndSaveAnalysis(DocumentEntity doc, String jsonResponse) {
        // Check again in case analysis was saved by another thread
        if (analysisRepository.existsByDocumentId(doc.getId())) {
            log.info("Analysis already exists for document {}, returning existing", doc.getId());
            return analysisRepository.findByDocumentId(doc.getId()).orElse(null);
        }
        
        try {
            // Clean JSON response (remove markdown code blocks if present)
            String cleanJson = jsonResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();
            
            JsonObject data = gson.fromJson(cleanJson, JsonObject.class);
            
            DocumentAnalysis analysis = DocumentAnalysis.builder()
                .document(doc)
                .summary(getJsonString(data, "summary"))
                .legalPoints(jsonArrayToString(data.getAsJsonArray("legalPoints")))
                .relevantLaws(jsonArrayToString(data.getAsJsonArray("relevantLaws")))
                .importantDates(jsonArrayToString(data.getAsJsonArray("importantDates")))
                .partiesInvolved(jsonArrayToString(data.getAsJsonArray("partiesInvolved")))
                .caseLawSuggestions(jsonArrayToString(data.getAsJsonArray("caseLawSuggestions")))
                .suggestedCategory(getJsonString(data, "suggestedCategory"))
                .riskAssessment(getJsonString(data, "riskAssessment"))
                .fullAnalysisJson(cleanJson)
                .analyzedAt(LocalDateTime.now())
                .analysisSuccess(true)
                .build();
                
            return analysisRepository.save(analysis);
            
        } catch (Exception e) {
            log.error("Failed to parse AI response", e);
            throw new RuntimeException("Failed to parse analysis: " + e.getMessage(), e);
        }
    }
    
    /**
     * Save failed analysis record
     */
    private void saveFailedAnalysis(DocumentEntity doc, String errorMsg) {
        // Skip if analysis already exists
        if (analysisRepository.existsByDocumentId(doc.getId())) {
            log.info("Analysis already exists for document {}, skipping failed save", doc.getId());
            return;
        }
        
        try {
            DocumentAnalysis analysis = DocumentAnalysis.builder()
                .document(doc)
                .analyzedAt(LocalDateTime.now())
                .analysisSuccess(false)
                .errorMessage(errorMsg)
                .build();
                
            analysisRepository.save(analysis);
        } catch (Exception e) {
            log.warn("Could not save failed analysis record: {}", e.getMessage());
        }
    }
    
    /**
     * Helper: Get string from JSON object
     */
    private String getJsonString(JsonObject obj, String key) {
        try {
            return obj.has(key) && !obj.get(key).isJsonNull() 
                ? obj.get(key).getAsString() 
                : "N/A";
        } catch (Exception e) {
            return "N/A";
        }
    }
    
    /**
     * Helper: Convert JSON array to formatted string
     */
    private String jsonArrayToString(JsonArray array) {
        if (array == null || array.size() == 0) {
            return "[]";
        }
        return gson.toJson(array);
    }
}
