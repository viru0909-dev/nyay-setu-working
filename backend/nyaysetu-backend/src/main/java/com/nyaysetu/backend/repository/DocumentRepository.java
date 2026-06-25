package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.dto.DocumentDto;
import com.nyaysetu.backend.entity.DocumentEntity;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, UUID> {
    List<DocumentEntity> findByCaseId(UUID caseId);
    long countByCaseId(UUID caseId);
    List<DocumentEntity> findByCategoryAndDescriptionContaining(String category, String description);
    Page<DocumentEntity> findByUploadedBy(Long uploadedBy, Pageable pageable);

    @Query("""
        SELECT new com.nyaysetu.backend.dto.DocumentDto(
            d.id, d.fileName, d.contentType, d.size, d.category, d.description,
            d.caseId, c.title, u.name, d.uploadedAt, d.fileUrl, d.fileHash,
            d.uploadIp, d.isVerified
        )
        FROM DocumentEntity d
        LEFT JOIN CaseEntity c ON d.caseId = c.id
        LEFT JOIN User u ON d.uploadedBy = u.id
        WHERE d.caseId = :caseId
    """)
    List<DocumentDto> findCaseDocumentsWithDetails(UUID caseId);
}
