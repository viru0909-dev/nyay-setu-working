package com.nyaysetu.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
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

    long countByStatusInAndUpdatedAtGreaterThanEqualAndUpdatedAtLessThan(
            Collection<CaseStatus> statuses,
            LocalDateTime start,
            LocalDateTime end);
    
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

    // Reverted invalid JOIN FETCH. If N+1 optimization is needed for documents, 
    // it must be handled via DTO projections or by adding a @OneToMany mapping in CaseEntity.
    @Query("SELECT c FROM CaseEntity c")
    List<CaseEntity> findAllWithDocuments();
}