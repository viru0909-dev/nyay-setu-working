package com.nyaysetu.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.exception.NotFoundException;
import com.nyaysetu.backend.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CaseService {

    private final CaseRepository caseRepository;
    private final CaseTimelineService timelineService;

    @Transactional
    public CaseEntity createCase(CreateCaseRequest dto) {
        CaseEntity caseEntity = CaseEntity.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(CaseStatus.OPEN)
                .build();

        CaseEntity saved = caseRepository.save(caseEntity);
        timelineService.addEvent(saved.getId(), "Case created");
        return saved;
    }

    public CaseEntity getCase(UUID id) {
        return caseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Case not found " + id));
    }

    public Page<CaseEntity> getAllCases(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return caseRepository.findAll(pageable);
    }

    public CaseEntity updateStatus(UUID caseId, CaseStatus status) {
        CaseEntity lc = getCase(caseId);
        lc.setStatus(status);
        caseRepository.save(lc);

        timelineService.addEvent(caseId, "Case status updated to " + status);
        return lc;
    }

    @Transactional
    public CaseEntity createAppeal(UUID parentCaseId, String reason) {
        CaseEntity parentCase = getCase(parentCaseId);

        CaseEntity appeal = CaseEntity.builder()
                .title("Appeal - " + parentCase.getTitle())
                .description(parentCase.getDescription())
                .caseType(parentCase.getCaseType())
                .status(CaseStatus.OPEN)
                .isAppeal(true)
                .parentCaseId(parentCaseId)
                .appealReason(reason)
                .appealStatus("PENDING")
                .appealLevel(1)
                .appealFiledDate(LocalDateTime.now())
                .build();

        CaseEntity savedAppeal = caseRepository.save(appeal);
        timelineService.addEvent(savedAppeal.getId(), "APPEAL_FILED", "Appeal filed against case " + parentCaseId);
        return savedAppeal;
    }

    public List<CaseEntity> getAppeals(UUID parentCaseId) {
        return caseRepository.findByParentCaseId(parentCaseId);
    }

    @Transactional
    public CaseEntity updateAppealStatus(UUID appealId, String status) {
        CaseEntity appeal = getCase(appealId);
        appeal.setAppealStatus(status);
        CaseEntity updatedAppeal = caseRepository.save(appeal);

        timelineService.addEvent(appealId, "APPEAL_STATUS_UPDATED", "Appeal status changed to " + status);
        return updatedAppeal;
    }

    // ==========================================
    // ⚙️ RESTORED COURT JURISDICTION METHODS
    // ==========================================

    @Transactional
    public CaseEntity autoAssignJudge(UUID caseId, Long judgeId) {
        CaseEntity caseEntity = getCase(caseId);
        caseEntity.setJudgeId(judgeId);
        caseEntity.setStatus(CaseStatus.ASSIGNED);
        CaseEntity saved = caseRepository.save(caseEntity);
        
        timelineService.addEvent(caseId, "JUDGE_AUTO_ASSIGNED", "Judge ID " + judgeId + " automatically assigned to case.");
        return saved;
    }

    @Transactional
    public CaseEntity takeCognizance(UUID caseId, String remarks) {
        CaseEntity caseEntity = getCase(caseId);
        caseEntity.setStatus(CaseStatus.UNDER_COGNIZANCE);
        caseEntity.setCognizanceRemarks(remarks);
        CaseEntity saved = caseRepository.save(caseEntity);
        
        timelineService.addEvent(caseId, "COGNIZANCE_TAKEN", "Court has taken cognizance. Remarks: " + remarks);
        return saved;
    }

    @Transactional
    public CaseEntity proposeLawyerToCase(UUID caseId, Long lawyerId) {
        CaseEntity caseEntity = getCase(caseId);
        caseEntity.setProposedLawyerId(lawyerId);
        caseEntity.setLawyerProposalStatus("PENDING");
        CaseEntity saved = caseRepository.save(caseEntity);
        
        timelineService.addEvent(caseId, "LAWYER_PROPOSED", "Lawyer ID " + lawyerId + " proposed to case context.");
        return saved;
    }

    @Transactional
    public CaseEntity respondToLawyerProposal(UUID caseId, boolean accepted) {
        CaseEntity caseEntity = getCase(caseId);
        if (accepted) {
            caseEntity.setLawyerId(caseEntity.getProposedLawyerId());
            caseEntity.setLawyerProposalStatus("ACCEPTED");
        } else {
            caseEntity.setLawyerProposalStatus("REJECTED");
        }
        caseEntity.setProposedLawyerId(null);
        CaseEntity saved = caseRepository.save(caseEntity);
        
        timelineService.addEvent(caseId, "LAWYER_PROPOSAL_RESPONSE", "Lawyer proposal review state finalized: " + (accepted ? "ACCEPTED" : "REJECTED"));
        return saved;
    }

    public List<CaseEntity> getPendingAssignmentCases() {
        return caseRepository.findByStatus(CaseStatus.OPEN);
    }

    public List<CaseEntity> getCasesByJudge(Long judgeId) {
        return caseRepository.findByJudgeId(judgeId);
    }

    public Long getJudgeWorkload(Long judgeId) {
        return caseRepository.countByJudgeIdAndStatusNot(judgeId, CaseStatus.CLOSED);
    }

    @Transactional
    public CaseEntity updateSummonsStatus(UUID caseId, String summonsStatus) {
        CaseEntity caseEntity = getCase(caseId);
        caseEntity.setSummonsStatus(summonsStatus);
        CaseEntity saved = caseRepository.save(caseEntity);
        
        timelineService.addEvent(caseId, "SUMMONS_STATUS_UPDATED", "Summons delivery trajectory state updated to: " + summonsStatus);
        return saved;
    }

    @Transactional
    public CaseEntity updateDocumentStatus(UUID caseId, UUID documentId, String documentStatus) {
        CaseEntity caseEntity = getCase(caseId);
        // Business logic execution mapping for verification records
        caseEntity.setLastReviewedDocumentId(documentId);
        caseEntity.setDocumentReviewStatus(documentStatus);
        CaseEntity saved = caseRepository.save(caseEntity);
        
        timelineService.addEvent(caseId, "DOCUMENT_STATUS_UPDATED", "Document ID " + documentId + " status updated to: " + documentStatus);
        return saved;
    }
}

