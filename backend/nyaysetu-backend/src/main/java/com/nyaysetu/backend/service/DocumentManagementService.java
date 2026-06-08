package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.DocumentDto;
import com.nyaysetu.backend.dto.UploadDocumentRequest;
import com.nyaysetu.backend.entity.*;
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
import java.time.LocalDateTime;

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

        String category = request.getCategory() != null ? request.getCategory() : "OTHER";
        String filePath = fileStorageService.storeFile(file, category);

        String fileHash = null;
        try {
            java.io.File physicalFile = fileStorageService.getFile(filePath);
            fileHash = blockchainService.calculateFileHash(physicalFile);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(DocumentManagementService.class)
                    .warn("Failed to calculate file hash: {}", e.getMessage());
        }

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
                .visibilityLevel("RESTRICTED")
                .build();

        DocumentEntity saved = documentRepository.save(document);

        // =========================
        // VERSION INIT (IMPORTANT)
        // =========================
        saved.setVersions(
                new java.util.ArrayList<>()
        );

        saved.getVersions().add(
                DocumentVersion.builder()
                        .fileUrl(saved.getFileUrl())
                        .timestamp(LocalDateTime.now())
                        .build()
        );

        documentRepository.save(saved);

        return convertToDto(saved);
    }

    public List<DocumentDto> getUserDocuments(Long userId) {
        return documentRepository.findAll().stream()
                .filter(doc -> doc.getUploadedBy().equals(userId))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<DocumentDto> getCaseDocuments(UUID caseId) {
        return documentRepository.findByCaseId(caseId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<DocumentDto> getCaseDocumentsWithAccessControl(UUID caseId, Long userId, String userRole) {
        return documentRepository.findByCaseId(caseId).stream()
                .filter(doc -> hasDocumentAccess(doc, userId, userRole))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void ensureDocumentAccess(UUID id, Long userId, String userRole) {
        DocumentEntity document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!hasDocumentAccess(document, userId, userRole)) {
            throw new RuntimeException("Unauthorized to access this document");
        }
    }

    private boolean hasDocumentAccess(DocumentEntity doc, Long userId, String userRole) {

        String visibility = doc.getVisibilityLevel() != null ? doc.getVisibilityLevel() : "PUBLIC";

        switch (visibility) {
            case "PUBLIC":
                return true;

            case "RESTRICTED":
                if ("JUDGE".equals(userRole)) return true;
                if (userId.equals(doc.getUploadedBy())) return true;
                return false;

            case "SEALED":
                return "JUDGE".equals(userRole);

            default:
                return false;
        }
        
        switch (visibility) {
            case "PUBLIC":
                return true; // Everyone can see public documents
                
            case "RESTRICTED":
                // Judge, uploader, or their lawyer can see
                if ("JUDGE".equals(userRole)) return true;
                if (userId.equals(doc.getUploadedBy())) return true;
                if ("LAWYER".equals(userRole) && doc.getCaseId() != null) {
                    CaseEntity caseEntity = caseRepository.findById(doc.getCaseId()).orElse(null);
                    if (caseEntity != null && caseEntity.getLawyer() != null
                            && caseEntity.getLawyer().getId().equals(userId)) {
                        return true;
                    }
                }
                return false;
                
            case "SEALED":
                return "JUDGE".equals(userRole); // Only judge
                
            default:
                return false; // Unknown visibility level - deny by default
        }
    }

    public DocumentDto getDocumentById(UUID id) {
        return convertToDto(
                documentRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Document not found"))
        );
    }

    public DocumentDto getDocumentById(UUID id, User user) {
        DocumentEntity document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        if (!canAccessDocument(document, user)) {
            throw new com.nyaysetu.backend.exception.AccessDeniedException("You do not have access to this document");
        }
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

        if (!document.getUploadedBy().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this document");
        }

        fileStorageService.deleteFile(document.getFileUrl());
        documentRepository.delete(document);
    }

    public void triggerAnalysis(UUID documentId) {
        DocumentEntity document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        java.io.File file = fileStorageService.getFile(document.getFileUrl());
        documentAnalysisService.analyzeDocumentAsync(document, file);
    }

    /**
     * Check if a user can access a document based on their relationship to the case
     */
    public boolean canAccessDocument(DocumentEntity doc, User user) {
        if (doc.getCaseId() == null) {
            return user.getId().equals(doc.getUploadedBy());
        }
        CaseEntity caseEntity = caseRepository.findById(doc.getCaseId()).orElse(null);
        if (caseEntity == null) {
            return user.getId().equals(doc.getUploadedBy());
        }
        if (user.getRole() == com.nyaysetu.backend.entity.Role.ADMIN
                || user.getRole() == com.nyaysetu.backend.entity.Role.SUPER_JUDGE) {
            return true;
        }
        if (caseEntity.getClient() != null && caseEntity.getClient().getId().equals(user.getId())) return true;
        if (caseEntity.getLawyer() != null && caseEntity.getLawyer().getId().equals(user.getId())) return true;
        if (caseEntity.getJudgeId() != null && caseEntity.getJudgeId().equals(user.getId())) return true;
        if (user.getRole() == com.nyaysetu.backend.entity.Role.JUDGE) return true;
        if (user.getEmail() != null && user.getEmail().equals(caseEntity.getRespondentEmail())) return true;
        return user.getId().equals(doc.getUploadedBy());
    }

    /**
     * Verify document hash against storage
     */
    public boolean verifyDocumentHash(UUID id) {
        DocumentEntity document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getFileHash() == null) return false;

        try {
            java.io.File file = fileStorageService.getFile(document.getFileUrl());
            return blockchainService.verifyFileIntegrity(file, document.getFileHash());
        } catch (Exception e) {
            return false;
        }
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

        if (entity.getCaseId() != null) {
            caseRepository.findById(entity.getCaseId())
                    .ifPresent(c -> dto.setCaseTitle(c.getTitle()));
        }

        if (entity.getUploadedBy() != null) {
            userRepository.findById(entity.getUploadedBy())
                    .ifPresent(u -> dto.setUploaderName(u.getName()));
        }

        return dto;
    }
}