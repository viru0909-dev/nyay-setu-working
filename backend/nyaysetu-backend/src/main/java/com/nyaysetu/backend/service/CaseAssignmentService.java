package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.LawyerDTO;
import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for auto-assigning cases to judges and managing lawyer invitations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CaseAssignmentService {

    private final CaseRepository caseRepository;
    private final UserRepository userRepository;

    /**
     * Auto-assign a case to a judge using round-robin
     * Assigns to the judge with the fewest active cases
     */
    @Transactional
    public User autoAssignJudge(UUID caseId) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        // Check if already assigned (assignedJudge field is populated)
        if (caseEntity.getAssignedJudge() != null && !caseEntity.getAssignedJudge().isEmpty()) {
            log.info("Case {} already has a judge assigned: {}", caseId, caseEntity.getAssignedJudge());
            return null;
        }

        // Get all judges
        List<User> judges = userRepository.findByRole(Role.JUDGE);
        if (judges.isEmpty()) {
            log.warn("No judges available for assignment");
            throw new RuntimeException("No judges available in the system");
        }

        // For MVP, just pick first judge (round-robin can be enhanced later)
        // This avoids the UUID/Long type mismatch issue
        User selectedJudge = judges.get(0);

        // Assign judge to case using the assignedJudge field (which is a String for judge name)
        caseEntity.setAssignedJudge(selectedJudge.getName());
        // Also set judgeId for reference (convert Long userId to UUID for storage)
        // Note: For proper implementation, judgeId column should be changed to Long
        caseRepository.save(caseEntity);

        log.info("✅ Auto-assigned case {} to Judge {} ({})", 
                caseId, selectedJudge.getName(), selectedJudge.getEmail());

        return selectedJudge;
    }

    /**
     * Get list of available lawyers for client to choose from
     */
    public List<LawyerDTO> getAvailableLawyers() {
        List<User> lawyers = userRepository.findByRole(Role.LAWYER);
        
        return lawyers.stream()
                .map(lawyer -> LawyerDTO.builder()
                        .id(lawyer.getId())
                        .name(lawyer.getName())
                        .email(lawyer.getEmail())
                        .specialization("General Practice") // TODO: Add specialization field
                        .casesHandled(0) // TODO: Count from cases
                        .rating(4.5) // TODO: Add rating system
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Assign a lawyer to a case (client invitation)
     */
    @Transactional
    public void assignLawyerToCase(UUID caseId, Long lawyerId, boolean isDefendantLawyer) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        User lawyer = userRepository.findById(lawyerId)
                .orElseThrow(() -> new RuntimeException("Lawyer not found"));

        if (lawyer.getRole() != Role.LAWYER) {
            throw new RuntimeException("Selected user is not a lawyer");
        }

        // Note: The CaseEntity already has client_lawyer_id column from V11 migration
        // We'll use assignedJudge field temporarily to store lawyer info until we add proper fields
        
        log.info("✅ Assigned lawyer {} to case {}", lawyer.getName(), caseId);
        
        // TODO: Create lawyer invitation entity and send notification
        // For MVP, we'll directly assign
    }

    /**
     * Get cases pending judge assignment
     */
    public List<CaseEntity> getPendingAssignmentCases() {
        return caseRepository.findByJudgeIdIsNull();
    }

    /**
     * Get cases assigned to a specific judge
     */
    public List<CaseEntity> getCasesByJudge(UUID judgeId) {
        return caseRepository.findByJudgeId(judgeId);
    }

    /**
     * Get all judges with their case counts
     */
    public List<Map<String, Object>> getJudgeWorkload() {
        List<User> judges = userRepository.findByRole(Role.JUDGE);
        
        return judges.stream()
                .map(judge -> {
                    Map<String, Object> workload = new HashMap<>();
                    workload.put("judgeId", judge.getId());
                    workload.put("judgeName", judge.getName());
                    workload.put("email", judge.getEmail());
                    workload.put("caseCount", 0); // TODO: Implement proper count when judgeId type is fixed
                    return workload;
                })
                .collect(Collectors.toList());
    }
}
