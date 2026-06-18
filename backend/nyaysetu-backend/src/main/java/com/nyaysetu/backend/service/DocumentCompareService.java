package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.DocumentCompareResponse;
import com.nyaysetu.backend.entity.DocumentEntity;
import com.nyaysetu.backend.entity.DocumentVersion;
import com.nyaysetu.backend.repository.DocumentRepository;
import com.nyaysetu.backend.repository.DocumentVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.UUID;

/**
 * Server-side document version comparison for Issue #560.
 * Extracts text from stored files and returns grouped diff results.
 */
@Service
@RequiredArgsConstructor
public class DocumentCompareService {

    private final DocumentVersionRepository versionRepository;
    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final PdfTextExtractorService pdfTextExtractorService;
    private final TextDiffService textDiffService;

    public DocumentCompareResponse compareVersions(
            UUID baseVersionId,
            UUID compareVersionId
    ) {
        DocumentVersion baseVersion = versionRepository.findById(baseVersionId)
                .orElseThrow(() -> new RuntimeException("Base version not found"));
        DocumentVersion compareVersion = versionRepository.findById(compareVersionId)
                .orElseThrow(() -> new RuntimeException("Compare version not found"));

        String baseText = extractDocumentText(baseVersion.getDocumentId());
        String compareText = extractDocumentText(compareVersion.getDocumentId());

        return textDiffService.compare(baseText, compareText);
    }

    private String extractDocumentText(UUID documentId) {
        DocumentEntity document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));

        if (document.getFileUrl() == null) {
            return "";
        }

        try {
            java.io.File file = fileStorageService.getFile(document.getFileUrl());
            String fileName = document.getFileName() != null
                    ? document.getFileName()
                    : file.getName();

            if (pdfTextExtractorService.isPdf(fileName)) {
                return pdfTextExtractorService.extractText(file);
            }

            if (fileName.toLowerCase().endsWith(".txt")) {
                return Files.readString(file.toPath(), StandardCharsets.UTF_8);
            }

            // Fallback: attempt plain-text read for other formats
            return Files.readString(file.toPath(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text for document " + documentId, e);
        }
    }
}
