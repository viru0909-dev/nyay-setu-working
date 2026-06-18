package com.nyaysetu.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.exception.NotFoundException;
import com.nyaysetu.backend.repository.CaseRepository;
import com.nyaysetu.backend.event.CaseStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final CaseRepository caseRepository;
    private final CaseTimelineService timelineService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public CaseEntity createCase(CreateCaseRequest dto) {
        CaseEntity caseEntity = CaseEntity.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(CaseStatus.PENDING)
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

    @Transactional
    public CaseEntity updateStatus(UUID caseId, CaseStatus status) {
        CaseEntity lc = getCase(caseId);
        lc.setStatus(status);
        CaseEntity saved = caseRepository.save(lc);

        timelineService.addEvent(caseId, "Case status updated to " + status);
        
        // 🔥 Decoupled Real-time Event broadcast hook
        eventPublisher.publishEvent(new CaseStatusChangedEvent(this, saved));
        
        return saved;
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

        timelineService.addEvent(
                savedAppeal.getId(),
                "APPEAL_FILED",
                "Appeal filed against case " + parentCaseId
        );

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

        timelineService.addEvent(
                appealId,
                "APPEAL_STATUS_UPDATED",
                "Appeal status changed to " + status
        );

        return updatedAppeal;
    }

}