package com.nyaysetu.caseservice.repository;

import com.nyaysetu.caseservice.entity.CaseEvidence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CaseEvidenceRepository extends JpaRepository<CaseEvidence, UUID> {
    List<CaseEvidence> findByLegalCaseId(UUID legalCaseId);
}