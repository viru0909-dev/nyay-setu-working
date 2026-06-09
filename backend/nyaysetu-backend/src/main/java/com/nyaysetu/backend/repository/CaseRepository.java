package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CaseRepository extends JpaRepository<CaseEntity, UUID> {
    @EntityGraph(attributePaths = {"documents"})
    List<CaseEntity> findByJudgeId(Long judgeId);

    @EntityGraph(attributePaths = {"documents"})
    List<CaseEntity> findByClient(User client);
    
    // For auto-assignment - find cases without judge
    @EntityGraph(attributePaths = {"documents"})
    List<CaseEntity> findByJudgeIdIsNull();
    
    // Find cases by status
    @EntityGraph(attributePaths = {"documents"})
    List<CaseEntity> findByStatus(CaseStatus status);
    
    // Count cases assigned to a judge (for round-robin)
    long countByJudgeId(Long judgeId);
    
    // Lawyer-specific queries
    @EntityGraph(attributePaths = {"documents"})
    List<CaseEntity> findByLawyer(User lawyer);
    long countByLawyer(User lawyer);
    
    // Find cases by assigned judge name/email
    @EntityGraph(attributePaths = {"documents"})
    List<CaseEntity> findByAssignedJudge(String judgeName);
    
    // Find unassigned cases (both null and empty string)
    @EntityGraph(attributePaths = {"documents"})
    List<CaseEntity> findByAssignedJudgeIsNull();
    
    @EntityGraph(attributePaths = {"documents"})
    @Query("SELECT c FROM CaseEntity c WHERE c.assignedJudge IS NULL OR c.assignedJudge = ''")
    List<CaseEntity> findUnassignedCases();
    
    // Find cases by respondent email
    @EntityGraph(attributePaths = {"documents"})
    List<CaseEntity> findByRespondentEmail(String respondentEmail);

    @EntityGraph(attributePaths = {"documents"})
    @Override
    Optional<CaseEntity> findById(UUID id);

    @EntityGraph(attributePaths = {"documents"})
    @Override
    List<CaseEntity> findAll();
}
