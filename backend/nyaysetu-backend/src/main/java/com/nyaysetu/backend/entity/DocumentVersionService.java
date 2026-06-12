package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.DocumentEntity;
import com.nyaysetu.backend.entity.DocumentVersion;
import com.nyaysetu.backend.repository.DocumentVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentVersionService {

    private final
    DocumentVersionRepository repository;

    public void createVersion(
            DocumentEntity document,
            String uploaderName
    ) {

        long versionCount =
                repository.countByDocumentId(
                        document.getId()
                );

        DocumentVersion version =
                DocumentVersion.builder()
                        .documentId(
                                document.getId()
                        )
                        .versionNumber(
                                (int) versionCount + 1
                        )
                        .uploadedAt(
                                LocalDateTime.now()
                        )
                        .uploadedBy(
                                uploaderName
                        )
                        .fileHash(
                                document.getFileHash()
                        )
                        .isVerified(
                                document.getIsVerified()
                )
                        .build();

        repository.save(version);
    }

    public List<DocumentVersion>
    getVersions(UUID documentId) {

        return repository
                .findByDocumentIdOrderByVersionNumberAsc(
                        documentId
                );
    }
}