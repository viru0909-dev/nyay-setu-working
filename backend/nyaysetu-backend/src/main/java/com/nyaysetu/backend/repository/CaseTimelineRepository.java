package com.nyaysetu.backend.repository;

import java.util.Optional;
import com.nyaysetu.backend.entity.CaseTimeline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CaseTimelineRepository extends JpaRepository<CaseTimeline, UUID> {
    List<CaseTimeline> findByLegalCaseIdOrderByTimestampAsc(UUID legalCaseId);
    List<CaseTimeline> findByLegalCaseId(UUID legalCaseId);

    List<CaseTimeline> findByLegalCaseIdAndEventType(
            UUID legalCaseId,
            String eventType
    );

    List<CaseTimeline> findByPerformedBy(String performedBy);
    Optional<CaseTimeline> findFirstByLegalCaseIdOrderByTimestampDesc(
            UUID legalCaseId
    );
}