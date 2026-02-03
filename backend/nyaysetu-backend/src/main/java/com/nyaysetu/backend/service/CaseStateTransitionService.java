package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * CaseStateTransitionService - Handles all case status transitions.
 * Implements the "Chain Reaction" handover between roles.
 * 
 * Workflow:
 * 1. Police → Judge: Submit to Court → PENDING_COGNIZANCE (broadcasts to judge pool)
 * 2. Lawyer → Litigant: Save Draft → DRAFT_REVIEW (shows action required)
 * 3. Litigant → Court: Approve → Enables court submission
 * 4. Judge → All: Cognizance → IN_ADMISSION (broadcasts to all parties)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CaseStateTransitionService {

    private final CaseRepository caseRepository;
    private final CaseEventService eventService;
    private final SimpMessagingTemplate messagingTemplate;

    // Stage names for the 7-step judicial process
    private static final String[] STAGE_NAMES = {
        "Cognizance",    // Stage 1
        "Summons",       // Stage 2
        "Appearance",    // Stage 3
        "Evidence",      // Stage 4
        "Arguments",     // Stage 5
        "Judgment",      // Stage 6
        "Verdict"        // Stage 7
    };

    /**
     * POLICE → COURT: Submit FIR/case to court.
     * Transitions: FIR_FILED → PENDING_COGNIZANCE
     * Broadcasts to: Judge's unassigned pool
     */
    @Transactional
    public CaseEntity policeSubmitToCourt(UUID caseId, String officerId, String officerName) {
        CaseEntity caseEntity = getCaseOrThrow(caseId);
        CaseStatus previousStatus = caseEntity.getStatus();

        // Validate transition
        if (previousStatus != CaseStatus.FIR_FILED && previousStatus != CaseStatus.PENDING) {
            throw new IllegalStateException("Case must be in FIR_FILED status to submit to court. Current: " + previousStatus);
        }

        // Update status
        caseEntity.setStatus(CaseStatus.PENDING_COGNIZANCE);
        caseEntity = caseRepository.save(caseEntity);

        // Log event
        eventService.logStatusChange(
                caseId,
                officerId,
                CaseEventService.ROLE_POLICE,
                officerName,
                previousStatus,
                CaseStatus.PENDING_COGNIZANCE,
                "Police submitted case to court for cognizance"
        );

        // Broadcast to judge's unassigned pool
        broadcastToJudgePool(caseEntity);

        log.info("Police {} submitted case {} to court", officerName, caseId);
        return caseEntity;
    }

    /**
     * LAWYER: Save draft petition.
     * Sets draftApprovalStatus to AWAITING_CLIENT.
     * Broadcasts action required to litigant.
     */
    @Transactional
    public CaseEntity lawyerSaveDraft(UUID caseId, String lawyerId, String lawyerName, String draftContent) {
        CaseEntity caseEntity = getCaseOrThrow(caseId);

        // Update draft and approval status
        caseEntity.setDraftPetition(draftContent);
        caseEntity.setDraftApprovalStatus("AWAITING_CLIENT");
        caseEntity = caseRepository.save(caseEntity);

        // Log event
        eventService.logEvent(
                caseId,
                CaseEventService.EVENT_LAWYER_DRAFT_SAVE,
                lawyerId,
                CaseEventService.ROLE_LAWYER,
                lawyerName,
                Map.of("draftLength", draftContent.length()),
                null,
                null,
                "Lawyer saved draft petition - awaiting client approval"
        );

        // Broadcast to litigant
        if (caseEntity.getClient() != null) {
            broadcastToLitigant(caseEntity.getClient().getId(), caseEntity, 
                    "Action Required: Approve Petition Draft");
        }

        log.info("Lawyer {} saved draft for case {}", lawyerName, caseId);
        return caseEntity;
    }

    /**
     * LITIGANT: Approve draft petition.
     * Enables court submission.
     */
    @Transactional
    public CaseEntity litigantApproveDraft(UUID caseId, String litigantId, String litigantName) {
        CaseEntity caseEntity = getCaseOrThrow(caseId);

        // Validate
        if (!"AWAITING_CLIENT".equals(caseEntity.getDraftApprovalStatus())) {
            throw new IllegalStateException("No draft awaiting approval");
        }

        // Update approval status
        caseEntity.setDraftApprovalStatus("APPROVED");
        caseEntity = caseRepository.save(caseEntity);

        // Log event
        eventService.logEvent(
                caseId,
                CaseEventService.EVENT_LITIGANT_APPROVE,
                litigantId,
                CaseEventService.ROLE_LITIGANT,
                litigantName,
                null,
                null,
                null,
                "Litigant approved draft petition"
        );

        // Broadcast to lawyer that submission is now enabled
        if (caseEntity.getLawyer() != null) {
            broadcastToLawyer(caseEntity.getLawyer().getId(), caseEntity,
                    "Client approved draft - submission enabled");
        }

        log.info("Litigant {} approved draft for case {}", litigantName, caseId);
        return caseEntity;
    }

    /**
     * LITIGANT: Reject draft petition.
     */
    @Transactional
    public CaseEntity litigantRejectDraft(UUID caseId, String litigantId, String litigantName, String reason) {
        CaseEntity caseEntity = getCaseOrThrow(caseId);

        caseEntity.setDraftApprovalStatus("REJECTED");
        caseEntity = caseRepository.save(caseEntity);

        // Log event
        eventService.logEvent(
                caseId,
                CaseEventService.EVENT_LITIGANT_REJECT,
                litigantId,
                CaseEventService.ROLE_LITIGANT,
                litigantName,
                Map.of("reason", reason != null ? reason : ""),
                null,
                null,
                "Litigant rejected draft petition: " + (reason != null ? reason : "No reason provided")
        );

        // Broadcast to lawyer
        if (caseEntity.getLawyer() != null) {
            broadcastToLawyer(caseEntity.getLawyer().getId(), caseEntity,
                    "Client rejected draft - revision needed");
        }

        return caseEntity;
    }

    /**
     * JUDGE: Take cognizance of case.
     * Transitions: PENDING_COGNIZANCE → IN_ADMISSION
     * Advances to Stage 1 (Cognizance).
     */
    @Transactional
    public CaseEntity judgeTakeCognizance(UUID caseId, Long judgeId, String judgeName) {
        CaseEntity caseEntity = getCaseOrThrow(caseId);
        CaseStatus previousStatus = caseEntity.getStatus();

        // Validate
        if (previousStatus != CaseStatus.PENDING_COGNIZANCE) {
            throw new IllegalStateException("Case must be in PENDING_COGNIZANCE to take cognizance");
        }

        // Update status and stage
        caseEntity.setStatus(CaseStatus.IN_ADMISSION);
        caseEntity.setJudgeId(judgeId);
        caseEntity.setCurrentJudicialStage(1); // Cognizance stage
        caseEntity = caseRepository.save(caseEntity);

        // Log status change event
        eventService.logStatusChange(
                caseId,
                judgeId.toString(),
                CaseEventService.ROLE_JUDGE,
                judgeName,
                previousStatus,
                CaseStatus.IN_ADMISSION,
                "Judge took cognizance of the case"
        );

        // Log stage change event
        eventService.logStageChange(caseId, judgeId.toString(), judgeName, 0, 1, "Cognizance");

        // Broadcast to all parties
        broadcastCaseUpdate(caseEntity, "Judge took cognizance - case admitted");

        log.info("Judge {} took cognizance of case {}", judgeName, caseId);
        return caseEntity;
    }

    /**
     * JUDGE: Advance case stage.
     */
    @Transactional
    public CaseEntity judgeAdvanceStage(UUID caseId, Long judgeId, String judgeName) {
        CaseEntity caseEntity = getCaseOrThrow(caseId);
        Integer currentStage = caseEntity.getCurrentJudicialStage();
        
        if (currentStage == null) currentStage = 0;
        if (currentStage >= 7) {
            throw new IllegalStateException("Case is already at final stage");
        }

        // Check if case can advance (must be trial ready for stage 4+)
        if (currentStage >= 3 && !caseEntity.isTrialReady()) {
            throw new IllegalStateException("Case is not trial ready. Check: summons delivered and BSA certified.");
        }

        int newStage = currentStage + 1;
        caseEntity.setCurrentJudicialStage(newStage);

        // Update status based on stage
        if (newStage == 6) {
            caseEntity.setStatus(CaseStatus.JUDGMENT_PENDING);
        } else if (newStage == 4 && caseEntity.isTrialReady()) {
            caseEntity.setStatus(CaseStatus.TRIAL_READY);
        }

        caseEntity = caseRepository.save(caseEntity);

        // Log stage change
        String stageName = newStage <= STAGE_NAMES.length ? STAGE_NAMES[newStage - 1] : "Unknown";
        eventService.logStageChange(caseId, judgeId.toString(), judgeName, currentStage, newStage, stageName);

        // Broadcast stage update
        messagingTemplate.convertAndSend(
                "/topic/case/" + caseId + "/stage",
                Map.of(
                        "caseId", caseId,
                        "previousStage", currentStage,
                        "newStage", newStage,
                        "stageName", stageName
                )
        );

        log.info("Judge {} advanced case {} to stage {}: {}", judgeName, caseId, newStage, stageName);
        return caseEntity;
    }

    /**
     * SYSTEM: Mark summons as served.
     */
    @Transactional
    public CaseEntity markSummonsServed(UUID caseId) {
        CaseEntity caseEntity = getCaseOrThrow(caseId);
        
        caseEntity.setSummonsDelivered(true);
        caseEntity.setSummonsStatus("SERVED");
        caseEntity = caseRepository.save(caseEntity);

        eventService.logSimpleEvent(
                caseId,
                CaseEventService.EVENT_SUMMONS_SERVED,
                "SYSTEM",
                CaseEventService.ROLE_SYSTEM,
                "System",
                "Summons successfully served to all parties"
        );

        // Check if case is now trial ready
        checkAndUpdateTrialReady(caseEntity);

        return caseEntity;
    }

    /**
     * Update BSA 63(4) certification status.
     */
    @Transactional
    public CaseEntity updateBsaCertification(UUID caseId, boolean certified, String validationDetails) {
        CaseEntity caseEntity = getCaseOrThrow(caseId);
        
        caseEntity.setBsa634Certified(certified);
        if (!certified) {
            caseEntity.setBlockingErrors(validationDetails);
        } else {
            caseEntity.setBlockingErrors(null);
        }
        caseEntity = caseRepository.save(caseEntity);

        String eventType = certified ? CaseEventService.EVENT_BSA_VALIDATED : CaseEventService.EVENT_BSA_FAILED;
        eventService.logEvent(
                caseId,
                eventType,
                "GROQ",
                CaseEventService.ROLE_SYSTEM,
                "Groq Validator",
                Map.of("certified", certified, "details", validationDetails),
                null,
                null,
                certified ? "BSA Section 63(4) compliance verified" : "BSA validation failed: " + validationDetails
        );

        // Check if case is now trial ready
        checkAndUpdateTrialReady(caseEntity);

        return caseEntity;
    }

    /**
     * Check if case meets trial ready conditions and update status.
     */
    private void checkAndUpdateTrialReady(CaseEntity caseEntity) {
        if (caseEntity.isTrialReady() && caseEntity.getStatus() != CaseStatus.TRIAL_READY) {
            CaseStatus previousStatus = caseEntity.getStatus();
            caseEntity.setStatus(CaseStatus.TRIAL_READY);
            caseRepository.save(caseEntity);

            eventService.logStatusChange(
                    caseEntity.getId(),
                    "SYSTEM",
                    CaseEventService.ROLE_SYSTEM,
                    "System",
                    previousStatus,
                    CaseStatus.TRIAL_READY,
                    "Case met all trial requirements (summons served + BSA certified)"
            );

            broadcastCaseUpdate(caseEntity, "Case is now Trial Ready");
        }
    }

    // ===== BROADCAST HELPERS =====

    private void broadcastToJudgePool(CaseEntity caseEntity) {
        messagingTemplate.convertAndSend(
                "/topic/judge/unassigned",
                Map.of(
                        "caseId", caseEntity.getId(),
                        "title", caseEntity.getTitle(),
                        "caseType", caseEntity.getCaseType(),
                        "filedDate", caseEntity.getFiledDate(),
                        "message", "New case pending cognizance"
                )
        );
    }

    private void broadcastToLitigant(Long litigantId, CaseEntity caseEntity, String message) {
        messagingTemplate.convertAndSend(
                "/topic/litigant/" + litigantId + "/actions",
                Map.of(
                        "caseId", caseEntity.getId(),
                        "title", caseEntity.getTitle(),
                        "actionRequired", true,
                        "message", message
                )
        );
    }

    private void broadcastToLawyer(Long lawyerId, CaseEntity caseEntity, String message) {
        messagingTemplate.convertAndSend(
                "/topic/lawyer/" + lawyerId + "/approvals",
                Map.of(
                        "caseId", caseEntity.getId(),
                        "title", caseEntity.getTitle(),
                        "message", message
                )
        );
    }

    private void broadcastCaseUpdate(CaseEntity caseEntity, String message) {
        messagingTemplate.convertAndSend(
                "/topic/case/" + caseEntity.getId() + "/status",
                Map.of(
                        "caseId", caseEntity.getId(),
                        "status", caseEntity.getStatus(),
                        "stage", caseEntity.getCurrentJudicialStage(),
                        "message", message
                )
        );
    }

    private CaseEntity getCaseOrThrow(UUID caseId) {
        return caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found: " + caseId));
    }
}
