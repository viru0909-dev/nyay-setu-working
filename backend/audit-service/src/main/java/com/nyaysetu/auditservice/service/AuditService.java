package com.nyaysetu.auditservice.service;

import com.nyaysetu.auditservice.dto.CreateAuditLogRequest;
import com.nyaysetu.auditservice.entity.AuditLog;
import com.nyaysetu.auditservice.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository repository;

    public void log(CreateAuditLogRequest request) {
        AuditLog log = AuditLog.builder()
                .userId(request.getUserId())
                .action(request.getAction())
                .description(request.getDescription())
                .timestamp(LocalDateTime.now())
                .build();

        repository.save(log);
    }
}
