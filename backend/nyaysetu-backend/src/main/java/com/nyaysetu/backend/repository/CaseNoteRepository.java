package com.nyaysetu.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nyaysetu.backend.entity.CaseNote;

public interface CaseNoteRepository extends JpaRepository<CaseNote, UUID> {
    List<CaseNote> findByCaseEntityId(UUID CaseEntityId);
}