package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

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
}
