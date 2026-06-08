package com.nyaysetu.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.entity.User;

@Repository
public interface CaseRepository extends JpaRepository<CaseEntity, UUID> {
    List<CaseEntity> findByJudgeId(Long judgeId);
    List<CaseEntity> findByClient(User client);
    
    // For auto-assignment - find cases without judge
    List<CaseEntity> findByJudgeIdIsNull();
    
    // Find cases by status
    List<CaseEntity> findByStatus(CaseStatus status);
    
    // Count cases assigned to a judge (for round-robin)
    long countByJudgeId(Long judgeId);
    
    // Lawyer-specific queries
    List<CaseEntity> findByLawyer(User lawyer);
    long countByLawyer(User lawyer);
    
    // Find cases by assigned judge name/email
    List<CaseEntity> findByAssignedJudge(String judgeName);
    
    // Find unassigned cases (both null and empty string)
    List<CaseEntity> findByAssignedJudgeIsNull();
    
    @Query("SELECT c FROM CaseEntity c WHERE c.assignedJudge IS NULL OR c.assignedJudge = ''")
    List<CaseEntity> findUnassignedCases();
    
    // Find cases by respondent email
    List<CaseEntity> findByRespondentEmail(String respondentEmail);

    // 🔥 PERF FIX: Resolves N+1 query problem by eagerly fetching lazy client and lawyer user relationships
    @Query(value = "SELECT c FROM CaseEntity c LEFT JOIN FETCH c.client LEFT JOIN FETCH c.lawyer",
           countQuery = "SELECT COUNT(c) FROM CaseEntity c")
    Page<CaseEntity> findAllWithDocuments(Pageable pageable);
}