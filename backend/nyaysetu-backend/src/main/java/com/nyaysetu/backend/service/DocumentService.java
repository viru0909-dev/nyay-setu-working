package com.nyaysetu.backend.service;

import com.nyaysetu.backend.config.FileStorageConfig;
import com.nyaysetu.backend.dto.UploadDocumentResponse;
import com.nyaysetu.backend.entity.DocumentEntity;
import com.nyaysetu.backend.entity.DocumentStorageType;
import com.nyaysetu.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final FileStorageConfig fileStorageConfig;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList("application/pdf", "image/jpeg",
            "image/png");

    public UploadDocumentResponse save(MultipartFile file, UUID caseId, UUID uploadedBy) {
        String contentType = file.getContentType();
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new RuntimeException("Invalid file type. Allowed types: PDF, JPG, PNG");
        }

        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (fileName.contains("..")) {
            throw new RuntimeException("Filename contains invalid path sequence " + fileName);
        }

        // Generate unique filename
        String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;
        Path targetLocation = Paths.get(fileStorageConfig.getUploadDir()).resolve(uniqueFileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", e);
        }

        DocumentEntity documentEntity = DocumentEntity.builder()
                .caseId(caseId)
                .fileName(uniqueFileName)
                .fileUrl(targetLocation.toString())
                .contentType(contentType)
                .size(file.getSize())
                .uploadedBy(uploadedBy)
                .storageType(DocumentStorageType.LOCAL)
                .build();

        DocumentEntity savedDoc = documentRepository.save(documentEntity);

        return UploadDocumentResponse.builder()
                .id(savedDoc.getId())
                .fileName(savedDoc.getFileName())
                .fileUrl(savedDoc.getFileUrl())
                .contentType(savedDoc.getContentType())
                .size(savedDoc.getSize())
                .build();
    }

    public List<DocumentEntity> getDocumentsByCase(UUID caseId) {
        return documentRepository.findByCaseId(caseId);
    }

    public DocumentEntity getDocument(UUID id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id " + id));
    }
}
