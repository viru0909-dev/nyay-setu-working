package com.nyaysetu.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.exception.NotFoundException;
import com.nyaysetu.backend.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final CaseRepository caseRepository;
    private final CaseTimelineService timelineService;

    @Transactional
    public CaseEntity createCase(CreateCaseRequest dto) {

        CaseEntity caseEntity = CaseEntity.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                // judgeId and parties removed from CreateCaseRequest
                .status(CaseStatus.OPEN)
                .build();

        CaseEntity saved = caseRepository.save(caseEntity);

        // Parties functionality removed from CreateCaseRequest
        // if (dto.getParties() != null && !dto.getParties().isEmpty()) {
        //     List<Party> parties = dto.getParties().stream()
        //             .map(p -> Party.builder()
        //                     .legalCaseId(saved.getId())
        //                     .name(p.getName())
        //                     .role(p.getRole())
        //                     .build())
        //             .collect(Collectors.toList());
        //
        //     partyRepository.saveAll(parties);
        // }

        timelineService.addEvent(saved.getId(), "Case created");

        return saved;
    }

    public CaseEntity getCase(UUID id) {
        return caseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Case not found " + id));
    }

    // Returns paginated CaseEntity records.
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