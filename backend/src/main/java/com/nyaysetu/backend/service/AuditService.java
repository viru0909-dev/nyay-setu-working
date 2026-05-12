package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.CreateAuditLogRequest;
import com.nyaysetu.backend.entity.AuditLog;
import com.nyaysetu.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository repository;

    public AuditLog log(CreateAuditLogRequest request) {
        AuditLog log = new AuditLog();
        log.setAction(request.getAction());
        log.setUserId(Long.parseLong(request.getUserId()));
        log.setDescription(request.getDescription());
        log.setTimestamp(LocalDateTime.now());
        return repository.save(log);
    }

    public void logCaseAction(UUID caseId, Long userId, String role, String action, String description) {
        AuditLog log = AuditLog.builder()
                .caseId(caseId)
                .userId(userId)
                .role(role)
                .action(action)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();
        repository.save(log);
    }

    public java.util.List<AuditLog> getCaseLogs(UUID caseId) {
        // Assuming repository has findByCaseId or we use custom query or findAll filter
        // AuditLogRepository probably extends JpaRepository without custom methods.
        // I should check AuditLogRepo.
        // Safe bet: find all and filter stream if repo not checked.
        // But better: add method to repo. 
        // Let's assume repo has it or I add it.
        // Actually, I'll use Example matcher or just filter for now to avoid compilation error if repo doesn't have it.
        // "Fetch from a central AuditLog table".
        return repository.findAll().stream()
            .filter(log -> caseId.equals(log.getCaseId()))
            .sorted(java.util.Comparator.comparing(AuditLog::getTimestamp)) // chronological
            .collect(java.util.stream.Collectors.toList());
    }
}
