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
                .legalCaseId(caseId)
                .event(event)
                .timestamp(LocalDateTime.now())
                .build());
    }

    public void addEvent(UUID caseId, String type, String description) {
        repo.save(CaseTimeline.builder()
                .legalCaseId(caseId)
                .event(type)
                .eventType(type)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build());
    }

    public void logAppealFiled(UUID caseId) {
        addEvent(
                caseId,
                "APPEAL_FILED",
                "Appeal has been filed"
        );
    }

    public void logVerdictUploaded(UUID caseId) {
        addEvent(
                caseId,
                "VERDICT_UPLOADED",
                "Verdict document uploaded"
        );
    }

    public void logVerdictArchived(UUID caseId) {
        addEvent(
                caseId,
                "VERDICT_ARCHIVED",
                "Verdict archived successfully"
        );
    }

    public List<CaseTimeline> getTimeline(UUID caseId) {
        return repo.findByLegalCaseIdOrderByTimestampAsc(caseId);
    }

    public void logPoliceViewed(UUID caseId, String officerName) {
        addEvent(caseId, "Police Officer " + officerName + " viewed the case files");
    }

    public void logJudgeAssigned(UUID caseId, String judgeName) {
        addEvent(caseId, "Case assigned to Hon'ble Judge " + judgeName);
    }

    public void logHearingScheduled(UUID caseId, LocalDateTime date) {
        addEvent(caseId, "Hearing scheduled for " + date.toLocalDate());
    }

}