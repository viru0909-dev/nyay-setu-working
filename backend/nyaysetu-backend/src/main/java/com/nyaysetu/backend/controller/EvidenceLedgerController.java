package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.ledger.cache.WriteAheadCacheService;
import com.nyaysetu.backend.ledger.chaincode.ChaincodeResponse;
import com.nyaysetu.backend.ledger.chaincode.WorldStateStore;
import com.nyaysetu.backend.ledger.gateway.FabricGatewayService;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.BlockchainService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.security.MessageDigest;
import java.util.*;

/**
 * REST controller for the Hyperledger Fabric-backed Evidence Ledger.
 * <p>
 * Exposes endpoints for evidence registration, custody transfer,
 * hash verification, and audit trail queries via the Fabric Gateway.
 */
@Tag(name = "Evidence Ledger", description = "Hyperledger Fabric-backed distributed ledger for chain-of-custody")
@RestController
@RequestMapping("/api/v1/ledger/evidence")
@RequiredArgsConstructor
@Slf4j
public class EvidenceLedgerController {

    private final FabricGatewayService fabricGateway;
    private final WriteAheadCacheService writeAheadCache;
    private final WorldStateStore worldStateStore;
    private final BlockchainService blockchainService;
    private final UserRepository userRepository;

    // ── Register Evidence ───────────────────────────────────────────────────

    @Operation(summary = "Register evidence on the distributed ledger")
    @PostMapping("/register")
    public ResponseEntity<?> registerEvidence(@RequestBody Map<String, String> request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            String evidenceId = request.get("evidenceId");
            String fileHash = request.get("fileHash");
            String title = request.getOrDefault("title", "Untitled Evidence");
            String caseId = request.getOrDefault("caseId", "UNKNOWN");

            if (evidenceId == null || fileHash == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "evidenceId and fileHash are required"));
            }

            // Buffer through write-ahead cache for latency resilience
            writeAheadCache.bufferWrite("registerEvidence", Map.of(
                    "evidenceId", evidenceId,
                    "fileHash", fileHash,
                    "title", title,
                    "caseId", caseId,
                    "uploaderRole", currentUser.getRole().name()
            ));

            // Also submit directly for immediate response
            ChaincodeResponse response = fabricGateway.registerEvidence(
                    evidenceId, fileHash, title, caseId, currentUser.getRole().name());

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("transactionId", response.getTransactionId());
            result.put("blockHeight", response.getBlockHeight());
            result.put("status", response.getStatus());
            result.put("evidenceId", evidenceId);
            result.put("fileHash", fileHash);
            result.put("channel", response.getChannelId());
            result.put("endorser", response.getEndorserMspId());
            result.put("message", "Evidence registered on distributed ledger");

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to register evidence on ledger", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Transfer Custody ────────────────────────────────────────────────────

    @Operation(summary = "Transfer custody of evidence between organizations")
    @PostMapping("/{evidenceId}/transfer")
    public ResponseEntity<?> transferCustody(
            @PathVariable String evidenceId,
            @RequestBody Map<String, String> request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            String toRole = request.get("toRole");
            String reason = request.getOrDefault("reason", "Custody transfer");

            if (toRole == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "toRole is required for custody transfer"));
            }

            ChaincodeResponse response = fabricGateway.transferCustody(
                    evidenceId, currentUser.getRole().name(), toRole, reason);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("transactionId", response.getTransactionId());
            result.put("blockHeight", response.getBlockHeight());
            result.put("status", response.getStatus());
            result.put("evidenceId", evidenceId);
            result.put("fromOrg", response.getEndorserMspId());
            result.put("message", "Custody transferred successfully");

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to transfer custody for evidence {}", evidenceId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get Custody Trail ───────────────────────────────────────────────────

    @Operation(summary = "Get full chain-of-custody trail for evidence")
    @GetMapping("/{evidenceId}/custody-trail")
    public ResponseEntity<?> getCustodyTrail(@PathVariable String evidenceId) {
        try {
            List<Map<String, Object>> trail = worldStateStore.getCustodyTrail(evidenceId);
            Map<String, Object> state = worldStateStore.getEvidenceState(evidenceId);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("evidenceId", evidenceId);
            result.put("currentCustodian", state != null ? state.get("currentCustodian") : "UNKNOWN");
            result.put("totalTransfers", trail.size());
            result.put("custodyTrail", trail);
            result.put("ledgerBlockHeight", worldStateStore.getCurrentBlockHeight());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to get custody trail for evidence {}", evidenceId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Verify Hash Against Ledger ──────────────────────────────────────────

    @Operation(summary = "Upload a file and verify its SHA-256 hash against the ledger record")
    @PostMapping("/{evidenceId}/verify-hash")
    public ResponseEntity<?> verifyHash(
            @PathVariable String evidenceId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "fileHash", required = false) String providedHash) {
        try {
            String hashToVerify;

            if (file != null && !file.isEmpty()) {
                // Compute SHA-256 of the uploaded file
                hashToVerify = computeFileSha256(file);
                log.info("Computed SHA-256 for uploaded file: {}...", hashToVerify.substring(0, 16));
            } else if (providedHash != null && !providedHash.isBlank()) {
                hashToVerify = providedHash;
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Either 'file' or 'fileHash' parameter is required"));
            }

            Map<String, Object> result = fabricGateway.verifyFileHash(evidenceId, hashToVerify);

            // Log this verification as an access audit
            User currentUser = getCurrentUser();
            if (currentUser != null) {
                fabricGateway.logAccessAudit(
                        evidenceId,
                        currentUser.getId().toString(),
                        currentUser.getRole().name(),
                        "VERIFY"
                );
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to verify hash for evidence {}", evidenceId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get Access Audit Log ────────────────────────────────────────────────

    @Operation(summary = "Get immutable access audit trail for evidence")
    @GetMapping("/{evidenceId}/audit-log")
    public ResponseEntity<?> getAuditLog(@PathVariable String evidenceId) {
        try {
            List<Map<String, Object>> auditLog = worldStateStore.getAccessAuditLog(evidenceId);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("evidenceId", evidenceId);
            result.put("totalEntries", auditLog.size());
            result.put("auditLog", auditLog);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to get audit log for evidence {}", evidenceId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── World State Stats ───────────────────────────────────────────────────

    @Operation(summary = "Get ledger world state statistics")
    @GetMapping("/stats")
    public ResponseEntity<?> getWorldStateStats() {
        return ResponseEntity.ok(worldStateStore.getWorldStateStats());
    }

    // ── Internal Helpers ────────────────────────────────────────────────────

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        String email = auth.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    /**
     * Compute SHA-256 hash of an uploaded file using streaming to handle
     * large files without loading entirely into memory.
     */
    private String computeFileSha256(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }
            byte[] hashBytes = digest.digest();
            StringBuilder hex = new StringBuilder();
            for (byte b : hashBytes) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute file SHA-256", e);
        }
    }
}
