package com.nyaysetu.caseservice.service;

import com.nyaysetu.caseservice.dto.CreateCaseRequest;
import com.nyaysetu.caseservice.dto.PartyDto;
import com.nyaysetu.caseservice.entity.*;
import com.nyaysetu.caseservice.exception.NotFoundException;
import com.nyaysetu.caseservice.repository.LegalCaseRepository;
import com.nyaysetu.caseservice.repository.PartyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final LegalCaseRepository legalCaseRepository;
    private final PartyRepository partyRepository;
    private final CaseTimelineService timelineService;

    @Transactional
    public LegalCase createCase(CreateCaseRequest dto) {

        LegalCase legalCase = LegalCase.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .judgeId(dto.getJudgeId())
                .status(CaseStatus.OPEN)
                .build();

        LegalCase saved = legalCaseRepository.save(legalCase);

        if (dto.getParties() != null && !dto.getParties().isEmpty()) {
            List<Party> parties = dto.getParties().stream()
                    .map(p -> Party.builder()
                            .legalCaseId(saved.getId())
                            .name(p.getName())
                            .role(p.getRole())
                            .build())
                    .collect(Collectors.toList());

            partyRepository.saveAll(parties);
        }

        timelineService.addEvent(saved.getId(), "Case created");

        return saved;
    }

    public LegalCase getCase(UUID id) {
        return legalCaseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Case not found " + id));
    }

    public List<LegalCase> getAllCases() {
        return legalCaseRepository.findAll();
    }

    public LegalCase updateStatus(UUID caseId, CaseStatus status) {
        LegalCase lc = getCase(caseId);
        lc.setStatus(status);
        legalCaseRepository.save(lc);

        timelineService.addEvent(caseId, "Case status updated to " + status);
        return lc;
    }
}