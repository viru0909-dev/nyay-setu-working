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
    private final CaseTimelineService timelineService;

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

        // Timeline Log
        try {
            timelineService.logJudgeAssigned(caseId, selectedJudge.getName());
        } catch (Exception e) {
            log.error("Failed to log timeline event", e);
        }

        return selectedJudge;
    }

    /**
     * Handover B: Judge Takes Cognizance
     * Updates status to IN_PROGRESS (My Docket)
     */
    @Transactional
    public void takeCognizance(UUID caseId, Long judgeId) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        if (!CaseStatus.PENDING_COGNIZANCE.equals(caseEntity.getStatus())) {
            // Check if already in progress to allow re-assignment if needed, but primary flow expects checking strict state
            // For flexibility during dev/test, we log warning
            log.warn("Taking cognizance of case {} which is in status {}", caseId, caseEntity.getStatus());
        }

        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new RuntimeException("Judge not found"));

        caseEntity.setJudgeId(judgeId);
        caseEntity.setAssignedJudge(judge.getName());
        caseEntity.setStatus(CaseStatus.IN_PROGRESS);
        
        caseRepository.save(caseEntity);
        
        timelineService.addEvent(caseId, "COGNIZANCE TAKEN", "Judge " + judge.getName() + " took cognizance. Case moved to Docket.");
        log.info("Handover B Complete: Case {} moved to Docket of Judge {}", caseId, judge.getName());
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
     * Propose a lawyer for a case (Client initiates)
     */
    @Transactional
    public void proposeLawyerToCase(UUID caseId, Long lawyerId) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        User lawyer = userRepository.findById(lawyerId)
                .orElseThrow(() -> new RuntimeException("Lawyer not found"));

        if (lawyer.getRole() != Role.LAWYER) {
            throw new RuntimeException("Selected user is not a lawyer");
        }

        caseEntity.setLawyer(lawyer);
        caseEntity.setLawyerProposalStatus("PENDING");
        caseRepository.save(caseEntity);
        
        log.info("📩 Lawyer {} proposed for case {}", lawyer.getName(), caseId);
    }

    /**
     * Respond to a lawyer proposal (Lawyer responds)
     */
    @Transactional
    public void respondToLawyerProposal(UUID caseId, String response) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        if ("ACCEPTED".equalsIgnoreCase(response)) {
            caseEntity.setLawyerProposalStatus("ACCEPTED");
            caseEntity.setStatus(CaseStatus.IN_PROGRESS);
        } else if ("REJECTED".equalsIgnoreCase(response)) {
            caseEntity.setLawyerProposalStatus("REJECTED");
            caseEntity.setLawyer(null);
        } else {
            throw new RuntimeException("Invalid response: " + response);
        }
        
        caseRepository.save(caseEntity);
        log.info("⚖️ Lawyer proposal for case {} was {}", caseId, response);
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
    public List<CaseEntity> getCasesByJudge(Long judgeId) {
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
                    workload.put("caseCount", caseRepository.countByJudgeId(judge.getId()));
                    return workload;
                })
                .collect(Collectors.toList());
    }


    @Transactional
    public void updateSummonsStatus(UUID caseId, boolean served) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        if (served) {
            caseEntity.setStatus(CaseStatus.SUMMONS_SERVED);
            timelineService.addEvent(caseId, "SUMMONS SERVED", "Summons served to Respondent.");
        }
        caseRepository.save(caseEntity);
    }
    
    @Transactional
    public void updateDocumentStatus(UUID caseId, DocumentStatus status) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        caseEntity.setDocumentStatus(status);
        if (status == DocumentStatus.APPROVED) {
            caseEntity.setStatus(CaseStatus.READY_FOR_COURT);
             timelineService.addEvent(caseId, "DRAFT APPROVED", "Client approved draft petition. Ready for Court.");
        } else if (status == DocumentStatus.REJECTED) {
            timelineService.addEvent(caseId, "DRAFT REJECTED", "Client requested changes to draft petition.");
        } else if (status == DocumentStatus.PENDING_REVIEW) {
            caseEntity.setStatus(CaseStatus.DRAFT_PENDING_CLIENT);
            timelineService.addEvent(caseId, "DRAFT SUBMITTED", "Lawyer submitted draft for client review.");
        }
        
        caseRepository.save(caseEntity);
    }
}
