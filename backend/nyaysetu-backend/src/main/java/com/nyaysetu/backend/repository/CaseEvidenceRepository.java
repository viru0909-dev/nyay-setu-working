package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseEvidence;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaseEvidenceRepository
        extends JpaRepository<CaseEvidence, UUID> {

    List<CaseEvidence> findByCaseEntity_Id(UUID caseId);
}