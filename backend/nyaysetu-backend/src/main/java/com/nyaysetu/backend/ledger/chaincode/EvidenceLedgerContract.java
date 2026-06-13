package com.nyaysetu.backend.ledger.chaincode;

import com.nyaysetu.backend.service.BlockchainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Simulated Hyperledger Fabric Smart Contract (Chaincode) for Evidence Ledger.
 * <p>
 * Implements three core transaction functions matching the Fabric chaincode
 * interface pattern:
 * <ol>
 *   <li>{@link #registerEvidence} — Commits evidence registration with SHA-256 hash</li>
 *   <li>{@link #transferCustody} — Records custody handover between organizations</li>
 *   <li>{@link #grantAccessAudit} — Logs read/view access grants as immutable entries</li>
 * </ol>
 * <p>
 * Each method writes to the {@link WorldStateStore} and produces a
 * {@link ChaincodeResponse} with a unique transaction ID, block height, and
 * cryptographic payload hash.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EvidenceLedgerContract {

    private final WorldStateStore worldStateStore;
    private final BlockchainService blockchainService;

    private static final String CHANNEL_ID = "evidence-channel";

    // ── registerEvidence ────────────────────────────────────────────────────

    /**
     * Register a new piece of evidence on the distributed ledger.
     * <p>
     * Computes a composite key from evidenceId, commits the file hash
     * and metadata to the world state, and returns a signed chaincode response.
     *
     * @param evidenceId unique identifier for the evidence
     * @param fileHash   SHA-256 hash of the evidence file content
     * @param metadata   additional metadata (title, type, uploader, caseId, etc.)
     * @param timestamp  the registration timestamp
     * @return chaincode response with transaction ID and block height
     */
    public ChaincodeResponse registerEvidence(String evidenceId, String fileHash,
                                               Map<String, String> metadata,
                                               LocalDateTime timestamp) {
        log.info("[Chaincode] registerEvidence invoked — evidenceId={}, hash={}...",
                evidenceId, fileHash != null && fileHash.length() > 16 ? fileHash.substring(0, 16) : fileHash);

        // Validate inputs
        if (evidenceId == null || evidenceId.isBlank()) {
            throw new IllegalArgumentException("evidenceId must not be null or blank");
        }
        if (fileHash == null || fileHash.length() != 64) {
            throw new IllegalArgumentException("fileHash must be a valid 64-char SHA-256 hex string");
        }

        // Check for duplicate registration
        if (worldStateStore.evidenceExists(evidenceId)) {
            log.warn("[Chaincode] Evidence {} already registered — returning existing state", evidenceId);
            Map<String, Object> existing = worldStateStore.getEvidenceState(evidenceId);
            return buildResponse("registerEvidence", evidenceId, existing, "ALREADY_EXISTS");
        }

        // Build evidence state
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("evidenceId", evidenceId);
        state.put("fileHash", fileHash);
        state.put("registeredAt", timestamp.toString());
        state.put("status", "REGISTERED");
        state.put("currentCustodian", metadata.getOrDefault("uploaderOrg", "UNKNOWN"));

        // Merge all metadata
        if (metadata != null) {
            metadata.forEach((k, v) -> state.putIfAbsent(k, v));
        }

        // Compute payload hash: SHA-256 of the serialized state
        String payloadHash = blockchainService.calculateHash(
                evidenceId + fileHash + timestamp.toString());

        state.put("payloadHash", payloadHash);

        // Commit to world state
        worldStateStore.putEvidenceState(evidenceId, state);

        // Also add initial custody entry
        Map<String, Object> initialCustody = new LinkedHashMap<>();
        initialCustody.put("action", "REGISTERED");
        initialCustody.put("fromOrg", "ORIGIN");
        initialCustody.put("toOrg", metadata.getOrDefault("uploaderOrg", "UNKNOWN"));
        initialCustody.put("reason", "Initial evidence registration");
        initialCustody.put("timestamp", timestamp.toString());
        initialCustody.put("txId", UUID.randomUUID().toString());
        worldStateStore.appendCustodyTransfer(evidenceId, initialCustody);

        log.info("[Chaincode] Evidence {} registered successfully at block {}",
                evidenceId, worldStateStore.getCurrentBlockHeight() + 1);

        return buildResponse("registerEvidence", evidenceId, state, "SUCCESS");
    }

    // ── transferCustody ─────────────────────────────────────────────────────

    /**
     * Transfer custody of evidence from one organization to another.
     * <p>
     * Validates that the evidence exists, records the handover in the
     * custody trail, and updates the current custodian in the world state.
     *
     * @param evidenceId unique identifier for the evidence
     * @param fromOrg    MSPID of the transferring organization
     * @param toOrg      MSPID of the receiving organization
     * @param reason     reason for the custody transfer
     * @param timestamp  the transfer timestamp
     * @return chaincode response with updated state
     */
    public ChaincodeResponse transferCustody(String evidenceId, String fromOrg,
                                              String toOrg, String reason,
                                              LocalDateTime timestamp) {
        log.info("[Chaincode] transferCustody invoked — evidence={}, {} → {}",
                evidenceId, fromOrg, toOrg);

        // Validate evidence exists
        Map<String, Object> state = worldStateStore.getEvidenceState(evidenceId);
        if (state == null) {
            throw new IllegalStateException("Evidence " + evidenceId + " not found in world state");
        }

        // Build transfer record
        String txId = UUID.randomUUID().toString();
        Map<String, Object> transferRecord = new LinkedHashMap<>();
        transferRecord.put("action", "CUSTODY_TRANSFER");
        transferRecord.put("txId", txId);
        transferRecord.put("fromOrg", fromOrg);
        transferRecord.put("toOrg", toOrg);
        transferRecord.put("reason", reason != null ? reason : "Custody transfer");
        transferRecord.put("timestamp", timestamp.toString());
        transferRecord.put("transferHash", blockchainService.calculateHash(
                evidenceId + fromOrg + toOrg + timestamp.toString()));

        // Append to custody trail
        worldStateStore.appendCustodyTransfer(evidenceId, transferRecord);

        // Update current custodian in state
        Map<String, Object> updatedState = new LinkedHashMap<>(state);
        updatedState.put("currentCustodian", toOrg);
        updatedState.put("lastTransferAt", timestamp.toString());
        updatedState.put("status", "IN_CUSTODY");
        worldStateStore.putEvidenceState(evidenceId, updatedState);

        log.info("[Chaincode] Custody transferred: {} → {} for evidence {}",
                fromOrg, toOrg, evidenceId);

        return buildResponse("transferCustody", evidenceId, transferRecord, "SUCCESS");
    }

    // ── grantAccessAudit ────────────────────────────────────────────────────

    /**
     * Log a read/view access event as an immutable audit entry.
     * <p>
     * Called whenever a Judge or Lawyer views evidence to create an
     * unalterable access trace compliant with Sec. 65B requirements.
     *
     * @param evidenceId unique identifier for the evidence
     * @param userId     the user who accessed the evidence
     * @param role       the user's role (JUDGE, LAWYER, etc.)
     * @param accessType type of access: READ, VIEW, DOWNLOAD, VERIFY
     * @param timestamp  when the access occurred
     * @return chaincode response confirming the audit entry
     */
    public ChaincodeResponse grantAccessAudit(String evidenceId, String userId,
                                               String role, String accessType,
                                               LocalDateTime timestamp) {
        log.info("[Chaincode] grantAccessAudit invoked — evidence={}, user={}, role={}, access={}",
                evidenceId, userId, role, accessType);

        // Build audit record
        String auditId = UUID.randomUUID().toString();
        Map<String, Object> auditRecord = new LinkedHashMap<>();
        auditRecord.put("auditId", auditId);
        auditRecord.put("evidenceId", evidenceId);
        auditRecord.put("userId", userId);
        auditRecord.put("role", role);
        auditRecord.put("accessType", accessType != null ? accessType : "READ");
        auditRecord.put("timestamp", timestamp.toString());
        auditRecord.put("auditHash", blockchainService.calculateHash(
                evidenceId + userId + role + accessType + timestamp.toString()));

        // Append to access audit log
        worldStateStore.appendAccessAudit(evidenceId, auditRecord);

        log.info("[Chaincode] Access audit recorded: {} by {} ({}) on evidence {}",
                accessType, userId, role, evidenceId);

        return buildResponse("grantAccessAudit", evidenceId, auditRecord, "SUCCESS");
    }

    // ── Query Methods (Evaluate Transaction) ────────────────────────────────

    /**
     * Query the current state of evidence from the world state.
     */
    public Map<String, Object> queryEvidence(String evidenceId) {
        return worldStateStore.getEvidenceState(evidenceId);
    }

    /**
     * Query the full custody trail for evidence.
     */
    public List<Map<String, Object>> queryCustodyTrail(String evidenceId) {
        return worldStateStore.getCustodyTrail(evidenceId);
    }

    /**
     * Query the access audit log for evidence.
     */
    public List<Map<String, Object>> queryAccessAuditLog(String evidenceId) {
        return worldStateStore.getAccessAuditLog(evidenceId);
    }

    // ── Internal Helpers ────────────────────────────────────────────────────

    private ChaincodeResponse buildResponse(String function, String evidenceId,
                                             Map<String, Object> payload, String status) {
        long newBlockHeight = worldStateStore.incrementBlockHeight();
        String txId = UUID.randomUUID().toString();

        return ChaincodeResponse.builder()
                .transactionId(txId)
                .blockHeight(newBlockHeight)
                .status(status)
                .timestamp(LocalDateTime.now())
                .function(function)
                .payloadHash(blockchainService.calculateHash(txId + newBlockHeight + function))
                .payload(payload)
                .endorserMspId(resolveEndorserMsp(evidenceId))
                .channelId(CHANNEL_ID)
                .build();
    }

    /**
     * Resolve which MSP endorsed this transaction based on the evidence state.
     * Falls back to JudiciaryOrgMSP if no custodian is known.
     */
    private String resolveEndorserMsp(String evidenceId) {
        Map<String, Object> state = worldStateStore.getEvidenceState(evidenceId);
        if (state != null) {
            Object custodian = state.get("currentCustodian");
            if (custodian != null) {
                return custodian.toString() + "MSP";
            }
        }
        return "JudiciaryOrgMSP";
    }
}
