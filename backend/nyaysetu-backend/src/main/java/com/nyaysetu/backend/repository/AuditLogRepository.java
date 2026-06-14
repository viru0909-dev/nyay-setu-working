package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    // Fetch audit logs for a specific case, ordered by timestamp
    List<AuditLog> findByCaseIdOrderByTimestampAsc(UUID caseId);
}
