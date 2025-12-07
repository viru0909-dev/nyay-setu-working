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
        // method name used in screenshots: findByLegalCaseIdOrderByTimestampAsc
        return repo.findByLegalCaseIdOrderByTimestampAsc(caseId);
    }
}