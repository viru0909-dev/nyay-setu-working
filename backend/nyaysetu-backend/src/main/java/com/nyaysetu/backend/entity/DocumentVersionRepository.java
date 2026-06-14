package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentVersionRepository
        extends JpaRepository<DocumentVersion, UUID> {

    List<DocumentVersion>
    findByDocumentIdOrderByVersionNumberAsc(
            UUID documentId
    );

    long countByDocumentId(UUID documentId);
}