package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.Hearing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HearingRepository extends JpaRepository<Hearing, UUID> {

    List<Hearing> findByLegalCaseIdOrderByScheduledAtAsc(UUID legalCaseId);
}