package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.Hearing;
import com.nyaysetu.backend.entity.LegalCase;
import com.nyaysetu.backend.exception.NotFoundException;
import com.nyaysetu.backend.repository.HearingRepository;
import com.nyaysetu.backend.repository.LegalCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HearingService {

    private final HearingRepository hearingRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final CaseTimelineService timelineService;

    @Transactional
    public Hearing scheduleHearing(UUID caseId, LocalDateTime when, String location, String notes) {

        LegalCase lc = legalCaseRepository.findById(caseId)
                .orElseThrow(() -> new NotFoundException("Case not found: " + caseId));

        Hearing hearing = Hearing.builder()
                .legalCaseId(caseId)
                .scheduledAt(when)
                .location(location)
                .notes(notes)
                .build();

        Hearing saved = hearingRepository.save(hearing);

        timelineService.addEvent(caseId, "Hearing scheduled on " + when + " at " + location);

        return saved;
    }

    public List<Hearing> getHearingsForCase(UUID caseId) {
        return hearingRepository.findByLegalCaseIdOrderByScheduledAtAsc(caseId);
    }
}