package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseAssignmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CaseAssignmentRecordRepository extends JpaRepository<CaseAssignmentRecord, Long> {
    List<CaseAssignmentRecord> findByCaseIdOrderByMatchScoreDesc(UUID caseId);
}