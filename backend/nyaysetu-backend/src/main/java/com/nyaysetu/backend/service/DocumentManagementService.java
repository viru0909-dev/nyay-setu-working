package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.DocumentDto;
import com.nyaysetu.backend.dto.UploadDocumentRequest;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.DocumentEntity;
import com.nyaysetu.backend.entity.DocumentStorageType;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.entity.VisibilityLevel;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.DocumentRepository;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
                .visibilityLevel(VisibilityLevel.RESTRICTED) // Default: only uploader, their lawyer, and judge can see
                .build();

        DocumentEntity saved = documentRepository.save(document);
        return convertToDto(saved);
    }

    public Page<DocumentDto> getUserDocuments(Long userId, Pageable pageable) {
        return documentRepository.findByUploadedBy(userId, pageable)
                .map(this::convertToDto);
    }

    public List<DocumentDto> getCaseDocuments(UUID caseId) {
        return documentRepository.findCaseDocumentsWithDetails(caseId);
    }
    
    /**
     * Get case documents with access control based on user's role
     */
    public List<DocumentDto> getCaseDocumentsWithAccessControl(UUID caseId, Long userId, String userRole, boolean isCaseLawyer) {
        List<DocumentEntity> allDocuments = documentRepository.findByCaseId(caseId);
        
        return allDocuments.stream()
                .filter(doc -> hasDocumentAccess(doc, userId, userRole, isCaseLawyer))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void ensureDocumentAccess(UUID id, Long userId, String userRole) {
        DocumentEntity document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        boolean isCaseLawyer = false;
        if ("LAWYER".equals(userRole) && userId != null && document.getCaseId() != null) {
            isCaseLawyer = caseRepository.findById(document.getCaseId())
                    .map(caseEntity -> caseEntity.getLawyer() != null && userId.equals(caseEntity.getLawyer().getId()))
                    .orElse(false);
        }

        if (!hasDocumentAccess(document, userId, userRole, isCaseLawyer)) {
            throw new RuntimeException("Unauthorized to access this document");
        }
    }
    
    /**
     * Check if user has access to a document
     */
    private boolean hasDocumentAccess(DocumentEntity doc, Long userId, String userRole, boolean isCaseLawyer) {
        VisibilityLevel visibility = doc.getVisibilityLevel() != null ? doc.getVisibilityLevel() : VisibilityLevel.PUBLIC;
        
        return switch (visibility) {
            case PUBLIC -> true; // Everyone can see public documents
            case RESTRICTED -> "JUDGE".equals(userRole)
                    || (userId != null && userId.equals(doc.getUploadedBy()))
                    || isCaseLawyer; // Assigned lawyers can access restricted case documents
            case SEALED -> "JUDGE".equals(userRole); // Only judge
        };
    }

    public DocumentDto getDocumentById(UUID id) {
        DocumentEntity document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        return convertToDto(document);
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
            org.slf4j.LoggerFactory.getLogger(DocumentManagementService.class)
                .warn("Hash verification skipped for doc {} (file may be missing): {}", id, e.getMessage());
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
