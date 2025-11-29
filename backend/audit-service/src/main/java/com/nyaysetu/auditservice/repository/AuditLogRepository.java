package com.nyaysetu.auditservice.repository;

import com.nyaysetu.auditservice.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
}
