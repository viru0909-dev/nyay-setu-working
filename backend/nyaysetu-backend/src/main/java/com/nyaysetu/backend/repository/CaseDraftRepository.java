package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository interface that exposes standardized database operations,
 * state validation queries, and secure citizen ownership tracking for CaseDraft staging entities.
 */
@Repository
public interface CaseDraftRepository extends JpaRepository<CaseDraft, Long> {

    /**
     * Security validation lookup: Resolves all staging drafts belonging to the authenticated citizen.
     * Prevents cross-tenant authorization leaks out-of-the-box.
     */
    List<CaseDraft> findByCitizenId(String citizenId);

    /**
     * Security validation lookup: Resolves a specific draft by ID and verifies owner access.
     */
    Optional<CaseDraft> findByIdAndCitizenId(Long id, String citizenId);

    /**
     * Analytics query lookup: Isolates drafts filtered by their lifecycle state machine bounds.
     */
    List<CaseDraft> findByStatus(String status);
}

