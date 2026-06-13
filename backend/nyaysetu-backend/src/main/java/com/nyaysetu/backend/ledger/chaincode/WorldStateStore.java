package com.nyaysetu.backend.ledger.chaincode;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Thread-safe in-memory world state simulating the Hyperledger Fabric
 * key-value store (CouchDB / LevelDB).
 * <p>
 * Maintains three namespaces:
 * <ul>
 *   <li><b>evidenceState</b> — Current state of each registered evidence item</li>
 *   <li><b>custodyTrail</b> — Append-only list of custody transfer records per evidence ID</li>
 *   <li><b>accessAuditLog</b> — Append-only list of read/view access records per evidence ID</li>
 * </ul>
 * <p>
 * Block height is tracked with an {@link AtomicLong} to simulate the
 * monotonically increasing ledger block counter.
 */
@Component
@Slf4j
public class WorldStateStore {

    /** Current state of evidence items: evidenceId → state map */
    private final ConcurrentHashMap<String, Map<String, Object>> evidenceState = new ConcurrentHashMap<>();

    /** Custody transfer trail: evidenceId → list of transfer records */
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<Map<String, Object>>> custodyTrail = new ConcurrentHashMap<>();

    /** Access audit log: evidenceId → list of access records */
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<Map<String, Object>>> accessAuditLog = new ConcurrentHashMap<>();

    /** Simulated block height counter */
    private final AtomicLong blockHeight = new AtomicLong(0);

    // ── Evidence State Operations ───────────────────────────────────────────

    /**
     * Put evidence state into the world state store.
     *
     * @param evidenceId unique evidence identifier
     * @param state      key-value map representing the evidence state
     */
    public void putEvidenceState(String evidenceId, Map<String, Object> state) {
        evidenceState.put(evidenceId, new ConcurrentHashMap<>(state));
        log.debug("WorldState PUT evidence: {} → {} keys", evidenceId, state.size());
    }

    /**
     * Get evidence state from the world state store.
     *
     * @param evidenceId unique evidence identifier
     * @return the state map, or null if not found
     */
    public Map<String, Object> getEvidenceState(String evidenceId) {
        return evidenceState.get(evidenceId);
    }

    /**
     * Check if evidence exists in the world state.
     */
    public boolean evidenceExists(String evidenceId) {
        return evidenceState.containsKey(evidenceId);
    }

    /**
     * Get all evidence IDs currently in the world state.
     */
    public Set<String> getAllEvidenceIds() {
        return Collections.unmodifiableSet(evidenceState.keySet());
    }

    // ── Custody Trail Operations ────────────────────────────────────────────

    /**
     * Append a custody transfer record for the given evidence.
     *
     * @param evidenceId     unique evidence identifier
     * @param transferRecord key-value map representing the transfer
     */
    public void appendCustodyTransfer(String evidenceId, Map<String, Object> transferRecord) {
        custodyTrail.computeIfAbsent(evidenceId, k -> new CopyOnWriteArrayList<>())
                    .add(Collections.unmodifiableMap(new HashMap<>(transferRecord)));
        log.debug("WorldState APPEND custody transfer for evidence: {}", evidenceId);
    }

    /**
     * Get the full custody trail for evidence.
     *
     * @param evidenceId unique evidence identifier
     * @return unmodifiable list of transfer records (empty list if none)
     */
    public List<Map<String, Object>> getCustodyTrail(String evidenceId) {
        CopyOnWriteArrayList<Map<String, Object>> trail = custodyTrail.get(evidenceId);
        return trail != null ? Collections.unmodifiableList(trail) : Collections.emptyList();
    }

    // ── Access Audit Log Operations ─────────────────────────────────────────

    /**
     * Append an access audit record for the given evidence.
     *
     * @param evidenceId  unique evidence identifier
     * @param auditRecord key-value map representing the access event
     */
    public void appendAccessAudit(String evidenceId, Map<String, Object> auditRecord) {
        accessAuditLog.computeIfAbsent(evidenceId, k -> new CopyOnWriteArrayList<>())
                      .add(Collections.unmodifiableMap(new HashMap<>(auditRecord)));
        log.debug("WorldState APPEND access audit for evidence: {}", evidenceId);
    }

    /**
     * Get the full access audit log for evidence.
     *
     * @param evidenceId unique evidence identifier
     * @return unmodifiable list of audit records (empty list if none)
     */
    public List<Map<String, Object>> getAccessAuditLog(String evidenceId) {
        CopyOnWriteArrayList<Map<String, Object>> auditLog = accessAuditLog.get(evidenceId);
        return auditLog != null ? Collections.unmodifiableList(auditLog) : Collections.emptyList();
    }

    // ── Block Height ────────────────────────────────────────────────────────

    /**
     * Increment and return the new block height.
     */
    public long incrementBlockHeight() {
        return blockHeight.incrementAndGet();
    }

    /**
     * Get the current block height.
     */
    public long getCurrentBlockHeight() {
        return blockHeight.get();
    }

    // ── Diagnostics ─────────────────────────────────────────────────────────

    /**
     * Get a snapshot of world state statistics.
     */
    public Map<String, Object> getWorldStateStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalEvidence", evidenceState.size());
        stats.put("totalCustodyTransfers", custodyTrail.values().stream()
                .mapToInt(List::size).sum());
        stats.put("totalAccessAudits", accessAuditLog.values().stream()
                .mapToInt(List::size).sum());
        stats.put("currentBlockHeight", blockHeight.get());
        stats.put("timestamp", LocalDateTime.now().toString());
        return stats;
    }
}
