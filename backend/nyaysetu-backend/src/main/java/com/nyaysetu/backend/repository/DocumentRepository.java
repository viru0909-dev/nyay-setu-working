package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.DocumentEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, UUID> {
    @EntityGraph(attributePaths = {"caseEntity"})
    @Override
    List<DocumentEntity> findAll();

    @EntityGraph(attributePaths = {"caseEntity"})
    List<DocumentEntity> findByCaseId(UUID caseId);

    @EntityGraph(attributePaths = {"caseEntity"})
    @Override
    Optional<DocumentEntity> findById(UUID id);

    List<DocumentEntity> findByCategoryAndDescriptionContaining(String category, String description);
}
