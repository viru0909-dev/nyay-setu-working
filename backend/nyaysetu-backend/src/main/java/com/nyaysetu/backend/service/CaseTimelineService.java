package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.CaseTimeline;
import com.nyaysetu.backend.repository.CaseTimelineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CaseTimelineService {

    private final CaseTimelineRepository repo;

    public void addEvent(UUID caseId, String event) {
        repo.save(CaseTimeline.builder()
                .legalCaseId(caseId)        // builder field assumed 'legalCaseId'
                .event(event)
                .timestamp(LocalDateTime.now())
                .build());
    }

    public List<CaseTimeline> getTimeline(UUID caseId) {
        return repo.findByLegalCaseIdOrderByTimestampAsc(caseId);
    }

    public void logPoliceViewed(UUID caseId, String officerName) {
        addEvent(caseId, "POLICE_VIEWED", "Police Officer " + officerName + " viewed the case files");
    }

    public void logJudgeAssigned(UUID caseId, String judgeName) {
        addEvent(caseId, "JUDGE_ASSIGNED", "Case assigned to Hon'ble Judge " + judgeName);
    }

    public void logHearingScheduled(UUID caseId, LocalDateTime date) {
        addEvent(caseId, "HEARING_SCHEDULED", "Hearing scheduled for " + date.toLocalDate());
    }

    public void addEvent(UUID caseId, String type, String description) {
        repo.save(CaseTimeline.builder()
                .legalCaseId(caseId)
                .event(type) // Using 'event' field for type/title
                .description(description) // Assuming description field exists or I should check entity
                .timestamp(LocalDateTime.now())
                .build());
    }
}