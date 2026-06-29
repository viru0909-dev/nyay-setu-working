package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.AuditLog;
import com.nyaysetu.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Enforces Merkle-style SHA-256 hash chaining on the audit log.
 *
 * Each entry's hash is computed over:
 *   sha256(action | userId | description | timestamp | previousHash)
 *
 * This means any deletion or modification of a row breaks every hash
 * that follows it, making tampering immediately detectable via /verify.
 */
@Service
@RequiredArgsConstructor
public class AuditChainService {

    /** Sentinel used as previousHash for the first entry in the chain. */
    static final String GENESIS_HASH = "0".repeat(64);

    private final AuditLogRepository repository;

    /**
     * Appends a new entry to the chain.
     * Synchronized to prevent concurrent threads racing on previousHash reads.
     */
    @Transactional
    public synchronized AuditLog appendEntry(AuditLog log) {
        String previousHash = repository.findTopByOrderByTimestampDesc()
                .map(AuditLog::getEntryHash)
                .orElse(GENESIS_HASH);

        log.setPreviousHash(previousHash);
        log.setEntryHash(computeHash(log, previousHash));
        return repository.save(log);
    }

    /**
     * Walks every entry in insertion order and returns all broken links.
     * A broken link means either:
     *   - the stored entryHash does not match the recomputed hash, or
     *   - the stored previousHash does not equal the preceding entry's entryHash.
     */
    public List<Map<String, Object>> verifyChain() {
        List<AuditLog> entries = repository.findAllByOrderByTimestampAsc();
        List<Map<String, Object>> broken = new ArrayList<>();
        String expectedPreviousHash = GENESIS_HASH;

        for (AuditLog entry : entries) {
            boolean linkMismatch = !expectedPreviousHash.equals(entry.getPreviousHash());
            boolean hashMismatch = !computeHash(entry, entry.getPreviousHash()).equals(entry.getEntryHash());

            if (linkMismatch || hashMismatch) {
                Map<String, Object> record = new HashMap<>();
                record.put("id", entry.getId().toString());
                record.put("timestamp", entry.getTimestamp() == null ? null : entry.getTimestamp().toString());
                record.put("reason", linkMismatch
                        ? "Chain broken: previousHash does not match predecessor entryHash"
                        : "Entry hash mismatch: data may have been modified");
                broken.add(record);
            }

            expectedPreviousHash = entry.getEntryHash();
        }

        return broken;
    }

    /**
     * Computes SHA-256 over: action|userId|description|timestamp|previousHash
     * Nulls are treated as empty string to ensure determinism.
     */
    String computeHash(AuditLog log, String previousHash) {
        String input = safe(log.getAction()) + "|"
                + safe(log.getUserId() == null ? null : log.getUserId().toString()) + "|"
                + safe(log.getDescription()) + "|"
                + safe(log.getTimestamp() == null ? null : log.getTimestamp().toString()) + "|"
                + safe(previousHash);
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(64);
            for (byte b : bytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available on this JVM", e);
        }
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}