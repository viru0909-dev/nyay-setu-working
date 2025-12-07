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
        log.setUserId(UUID.fromString(request.getUserId()));
        log.setDescription(request.getDescription());
        log.setTimestamp(LocalDateTime.now());
        return repository.save(log);
    }
}
