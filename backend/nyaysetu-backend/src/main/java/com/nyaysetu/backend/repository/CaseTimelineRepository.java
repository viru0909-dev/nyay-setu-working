package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseTimeline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CaseTimelineRepository extends JpaRepository<CaseTimeline, UUID> {
    List<CaseTimeline> findByLegalCaseIdOrderByTimestampAsc(UUID legalCaseId);
}