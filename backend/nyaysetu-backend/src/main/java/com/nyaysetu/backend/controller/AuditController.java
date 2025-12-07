package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CreateAuditLogRequest;
import com.nyaysetu.backend.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @PostMapping("/log")
    public ResponseEntity<String> createLog(@RequestBody CreateAuditLogRequest request) {
        auditService.log(request);
        return ResponseEntity.ok("Logged");
    }
}
