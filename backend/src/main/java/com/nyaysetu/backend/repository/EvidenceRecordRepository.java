package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.EvidenceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EvidenceRecordRepository extends JpaRepository<EvidenceRecord, UUID> {

    /**
     * Find all evidence for a case, ordered by block index (chain order)
     */
    List<EvidenceRecord> findByCaseEntityIdOrderByBlockIndexAsc(UUID caseId);

    /**
     * Find the latest block in the chain for a case
     */
    Optional<EvidenceRecord> findTopByCaseEntityIdOrderByBlockIndexDesc(UUID caseId);

    /**
     * Count evidence records for a case
     */
    long countByCaseEntityId(UUID caseId);

    /**
     * Find evidence by block hash
     */
    Optional<EvidenceRecord> findByBlockHash(String blockHash);

    /**
     * Find all tampered records
     */
    List<EvidenceRecord> findByVerificationStatus(String status);

    /**
     * Check if any evidence exists for a case
     */
    boolean existsByCaseEntityId(UUID caseId);

    /**
     * Find evidence uploaded by a specific user
     */
    List<EvidenceRecord> findByUploadedByIdOrderByCreatedAtDesc(Long userId);
}
