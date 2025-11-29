package com.nyaysetu.auditservice.controller;

import com.nyaysetu.auditservice.dto.CreateAuditLogRequest;
import com.nyaysetu.auditservice.service.AuditService;
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
