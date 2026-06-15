package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.DocumentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, UUID> {

    List<DocumentEntity> findByCaseId(UUID caseId);

    long countByCaseId(UUID caseId);

    List<DocumentEntity> findByCategoryAndDescriptionContaining(
            String category,
            String description
    );

    Page<DocumentEntity> findByUploadedBy(
            Long uploadedBy,
            Pageable pageable
    );

    @Query("""
        SELECT d FROM DocumentEntity d
        WHERE d.uploadedBy = :userId
        AND (
                LOWER(COALESCE(d.fileName, '')) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(COALESCE(d.description, '')) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(COALESCE(d.category, '')) LIKE LOWER(CONCAT('%', :query, '%'))
        )
     """)
    Page<DocumentEntity> searchDocuments(
        @Param("query") String query,
        @Param("userId") Long userId,
        Pageable pageable
    );
}