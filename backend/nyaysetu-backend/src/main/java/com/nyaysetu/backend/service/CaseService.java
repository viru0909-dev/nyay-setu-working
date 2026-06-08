package com.nyaysetu.backend.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable; // FIXED: Imported CaseRepository
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nyaysetu.backend.dto.CreateCaseRequest;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.exception.NotFoundException;
import com.nyaysetu.backend.repository.CaseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CaseService {

    // FIXED: Changed fields to point to your precise repository class
    private final CaseRepository caseRepository;
    private final CaseTimelineService timelineService;

    @Transactional
    public CaseEntity createCase(CreateCaseRequest dto) {

        // FIXED: Using CaseEntity to create a new case mapping
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

    // FIXED: Refactored method consuming your optimized N+1 JOIN FETCH query method
    public Page<CaseEntity> getAllCases(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return caseRepository.findAllWithDocuments(pageable);
    }

    public CaseEntity updateStatus(UUID caseId, CaseStatus status) {
        CaseEntity lc = getCase(caseId);
        lc.setStatus(status);
        caseRepository.save(lc);

        timelineService.addEvent(caseId, "Case status updated to " + status);
        return lc;
    }
}