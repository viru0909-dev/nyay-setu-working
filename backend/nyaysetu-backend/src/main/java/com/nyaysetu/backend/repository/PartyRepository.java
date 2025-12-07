package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.Party;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PartyRepository extends JpaRepository<Party, UUID> {
    List<Party> findByLegalCaseId(UUID legalCaseId);
}