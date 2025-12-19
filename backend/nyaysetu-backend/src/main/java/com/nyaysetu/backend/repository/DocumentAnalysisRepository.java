package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.DocumentAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentAnalysisRepository extends JpaRepository<DocumentAnalysis, UUID> {
    
    Optional<DocumentAnalysis> findByDocumentId(UUID documentId);
    
    boolean existsByDocumentId(UUID documentId);
}
