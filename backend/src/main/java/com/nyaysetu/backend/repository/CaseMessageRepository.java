package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CaseMessageRepository extends JpaRepository<CaseMessage, UUID> {

    List<CaseMessage> findByLegalCaseIdOrderByTimestampAsc(UUID legalCaseId);
}