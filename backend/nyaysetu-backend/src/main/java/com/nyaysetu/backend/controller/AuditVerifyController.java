package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.service.AuditChainService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin-only endpoint to verify audit log chain integrity.
 * Secured by SecurityConfig under /api/admin/** (ADMIN, SUPER_JUDGE, TECH_ADMIN).
 */
@Tag(name = "Audit Verification", description = "Verify tamper-evidence of the audit log hash chain")
@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
public class AuditVerifyController {

    private final AuditChainService auditChainService;

    /**
     * GET /api/admin/audit/verify
     *
     * Walks the full audit log chain and reports broken links.
     * Returns 200 OK  with status=INTACT when all hashes verify.
     * Returns 409 CONFLICT with status=TAMPERED and broken link details when tampering is detected.
     */
    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyChain() {
        List<Map<String, Object>> brokenLinks = auditChainService.verifyChain();

        Map<String, Object> body = new HashMap<>();
        if (brokenLinks.isEmpty()) {
            body.put("status", "INTACT");
            body.put("message", "All audit log entries verified successfully");
            return ResponseEntity.ok(body);
        }

        body.put("status", "TAMPERED");
        body.put("brokenLinks", brokenLinks);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }
}