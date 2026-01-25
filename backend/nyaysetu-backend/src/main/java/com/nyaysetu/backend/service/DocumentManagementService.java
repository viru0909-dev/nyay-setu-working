package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.DocumentDto;
import com.nyaysetu.backend.dto.UploadDocumentRequest;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.DocumentEntity;
import com.nyaysetu.backend.entity.DocumentStorageType;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.DocumentRepository;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentManagementService {

    private final DocumentRepository documentRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final DocumentAnalysisService documentAnalysisService;
    private final BlockchainService blockchainService;

    @Transactional
    public DocumentDto uploadDocument(MultipartFile file, UploadDocumentRequest request, User uploader, String uploadIp) {
        // Store file
        String category = request.getCategory() != null ? request.getCategory() : "OTHER";
        String filePath = fileStorageService.storeFile(file, category);

        // Calculate SHA-256 hash for data integrity (Section 63(4) compliance)
        String fileHash = null;
        try {
            java.io.File physicalFile = fileStorageService.getFile(filePath);
            fileHash = blockchainService.calculateFileHash(physicalFile);
            org.slf4j.LoggerFactory.getLogger(DocumentManagementService.class)
                .info("Document SHA-256 hash calculated: {}", fileHash);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(DocumentManagementService.class)
                .warn("Failed to calculate file hash: {}", e.getMessage());
        }

        // Create document entity
        DocumentEntity document = DocumentEntity.builder()
                .fileName(file.getOriginalFilename())
                .fileUrl(filePath)
                .contentType(file.getContentType())
                .size(file.getSize())
                .category(category)
                .description(request.getDescription())
                .uploadedBy(uploader.getId())
                .caseId(request.getCaseId())
                .storageType(DocumentStorageType.LOCAL)
                .fileHash(fileHash)
                .uploadIp(uploadIp)
                .isVerified(fileHash != null)
                .build();

        DocumentEntity saved = documentRepository.save(document);
        return convertToDto(saved);
    }

    public List<DocumentDto> getUserDocuments(Long userId) {
        List<DocumentEntity> documents = documentRepository.findAll().stream()
                .filter(doc -> doc.getUploadedBy().equals(userId))
                .collect(Collectors.toList());
        return documents.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<DocumentDto> getCaseDocuments(UUID caseId) {
        List<DocumentEntity> documents = documentRepository.findByCaseId(caseId);
        return documents.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public DocumentDto getDocumentById(UUID id) {
        DocumentEntity document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        return convertToDto(document);
    }

    public Resource downloadDocument(UUID id) {
        DocumentEntity document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        return fileStorageService.loadFileAsResource(document.getFileUrl());
    }

    @Transactional
    public void deleteDocument(UUID id, Long userId) {
        DocumentEntity document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Check ownership
        if (!document.getUploadedBy().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this document");
        }

        // Delete file from storage
        fileStorageService.deleteFile(document.getFileUrl());

        // Delete from database
        documentRepository.delete(document);
    }

    /**
     * Trigger AI analysis for a document
     */
    public void triggerAnalysis(UUID documentId) {
        DocumentEntity document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
                
        // Get the actual file from storage
        java.io.File file = fileStorageService.getFile(document.getFileUrl());
        
        // Trigger async analysis
        documentAnalysisService.analyzeDocumentAsync(document, file);
    }

    private DocumentDto convertToDto(DocumentEntity entity) {
        DocumentDto dto = DocumentDto.builder()
                .id(entity.getId())
                .fileName(entity.getFileName())
                .contentType(entity.getContentType())
                .size(entity.getSize())
                .category(entity.getCategory())
                .description(entity.getDescription())
                .caseId(entity.getCaseId())
                .uploadedAt(entity.getUploadedAt())
                .fileUrl(entity.getFileUrl())
                .fileHash(entity.getFileHash())
                .uploadIp(entity.getUploadIp())
                .isVerified(entity.getIsVerified())
                .build();

        // Get case title if available
        if (entity.getCaseId() != null) {
            caseRepository.findById(entity.getCaseId())
                    .ifPresent(caseEntity -> dto.setCaseTitle(caseEntity.getTitle()));
        }

        // Get uploader name if available
        if (entity.getUploadedBy() != null) {
            userRepository.findById(entity.getUploadedBy())
                    .ifPresent(user -> dto.setUploaderName(user.getName()));
        }

        return dto;
    }
}
