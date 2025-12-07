package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CaseNoteRepository extends JpaRepository<CaseNote, UUID> {
    List<CaseNote> findByLegalCaseId(UUID legalCaseId);
}