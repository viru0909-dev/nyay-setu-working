package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByCaseIdOrderByTimestampAsc(UUID caseId);
    /** Returns the most recently persisted entry — used to retrieve its hash for chaining. */
    Optional<AuditLog> findTopByOrderByTimestampDesc();
    /** Returns all entries in insertion order — used by the chain verification walk. */
    List<AuditLog> findAllByOrderByTimestampAsc();
}