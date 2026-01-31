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
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @PostMapping("/log")
    public ResponseEntity<String> createLog(@RequestBody CreateAuditLogRequest request) {
        auditService.log(request);
        return ResponseEntity.ok("Logged");
    }

    @org.springframework.web.bind.annotation.GetMapping("/case/{caseId}")
    public ResponseEntity<?> getCaseLogs(@org.springframework.web.bind.annotation.PathVariable java.util.UUID caseId) {
        // We need repository access here or in service. Let's assume service.
        // But AuditService didn't have a get method in my previous edit.
        // I will add repository injection here for speed, or assume Service has it.
        // Actually best practice is service. 
        // Since I can't easily multi-edit, I'll access repository via service if I added it? No I didn't.
        // I'll inject Repository here directly as 'auditService' was injected.
        // Wait, 'auditService' is private final. I can't add fields easily with replace.
        // I'll use a pragmatic approach: The user asked to "Fetch from a central AuditLog table".
        // I'll assume I can autowire the Repository or add a method to Service in next step if needed.
        // But wait, I can just ADD the repository to the constructor or use field injection if I could.
        // I'll use the existing 'auditService' and assume I'll add 'getCaseLogs' to it.
        return ResponseEntity.ok(auditService.getCaseLogs(caseId));
    }
}
