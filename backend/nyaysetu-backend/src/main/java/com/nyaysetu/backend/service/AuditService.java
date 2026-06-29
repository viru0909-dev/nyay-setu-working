package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.CreateAuditLogRequest;
import com.nyaysetu.backend.entity.AuditLog;
import com.nyaysetu.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository repository;
    private final AuditChainService auditChainService;

    @Async
    public AuditLog log(CreateAuditLogRequest request) {
        AuditLog log = new AuditLog();
        log.setAction(request.getAction());
        log.setUserId(Long.parseLong(request.getUserId()));
        log.setDescription(request.getDescription());
        log.setTimestamp(LocalDateTime.now());
        return auditChainService.appendEntry(log);
    }

    @Async
    public void logCaseAction(UUID caseId, Long userId, String role, String action, String description) {
        AuditLog log = AuditLog.builder()
                .caseId(caseId)
                .userId(userId)
                .role(role)
                .action(action)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();
        auditChainService.appendEntry(log);
    }

    public List<AuditLog> getCaseLogs(UUID caseId) {
        return repository.findByCaseIdOrderByTimestampAsc(caseId);
    }
}