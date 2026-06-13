package com.nyaysetu.backend.ledger.gateway;

import com.nyaysetu.backend.ledger.chaincode.ChaincodeResponse;
import com.nyaysetu.backend.ledger.chaincode.EvidenceLedgerContract;
import com.nyaysetu.backend.ledger.chaincode.WorldStateStore;
import com.nyaysetu.backend.service.BlockchainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service layer mimicking the {@code hyperledger-fabric-gateway-java} SDK
 * contract invocation pattern.
 * <p>
 * Provides two primary methods:
 * <ul>
 *   <li>{@link #submitTransaction} — Write operations (invoke chaincode)</li>
 *   <li>{@link #evaluateTransaction} — Read-only queries (query chaincode)</li>
 * </ul>
 * <p>
 * Routes function names to the appropriate {@link EvidenceLedgerContract}
 * method and integrates with {@link BlockchainService} for hash computation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FabricGatewayService {

    private final EvidenceLedgerContract ledgerContract;
    private final FabricNetworkConfig networkConfig;
    private final WorldStateStore worldStateStore;
    private final BlockchainService blockchainService;

    // ── Submit Transaction (Write) ──────────────────────────────────────────

    /**
     * Submit a transaction to the evidence ledger chaincode.
     * <p>
     * This is analogous to {@code contract.submitTransaction()} in the
     * Fabric Gateway SDK — it endorses, orders, and commits the transaction.
     *
     * @param functionName the chaincode function to invoke
     * @param args         arguments for the function
     * @return chaincode response
     */
    public ChaincodeResponse submitTransaction(String functionName, Map<String, String> args) {
        log.info("[Gateway] submitTransaction: {} with {} args on channel '{}'",
                functionName, args.size(), networkConfig.getChannelName());

        LocalDateTime now = LocalDateTime.now();

        return switch (functionName) {
            case "registerEvidence" -> {
                String evidenceId = requireArg(args, "evidenceId");
                String fileHash = requireArg(args, "fileHash");
                Map<String, String> metadata = new LinkedHashMap<>(args);
                metadata.remove("evidenceId");
                metadata.remove("fileHash");
                // Map role to org for custodian tracking
                String role = args.getOrDefault("uploaderRole", "UNKNOWN");
                metadata.put("uploaderOrg", networkConfig.resolveMspId(role));
                yield ledgerContract.registerEvidence(evidenceId, fileHash, metadata, now);
            }
            case "transferCustody" -> {
                String evidenceId = requireArg(args, "evidenceId");
                String fromOrg = args.getOrDefault("fromOrg",
                        networkConfig.resolveMspId(args.getOrDefault("fromRole", "UNKNOWN")));
                String toOrg = args.getOrDefault("toOrg",
                        networkConfig.resolveMspId(args.getOrDefault("toRole", "UNKNOWN")));
                String reason = args.getOrDefault("reason", "Custody transfer");
                yield ledgerContract.transferCustody(evidenceId, fromOrg, toOrg, reason, now);
            }
            case "grantAccessAudit" -> {
                String evidenceId = requireArg(args, "evidenceId");
                String userId = requireArg(args, "userId");
                String role = args.getOrDefault("role", "UNKNOWN");
                String accessType = args.getOrDefault("accessType", "READ");
                yield ledgerContract.grantAccessAudit(evidenceId, userId, role, accessType, now);
            }
            default -> throw new IllegalArgumentException(
                    "Unknown chaincode function: " + functionName);
        };
    }

    // ── Evaluate Transaction (Read-Only) ────────────────────────────────────

    /**
     * Evaluate a read-only query against the evidence ledger.
     * <p>
     * This is analogous to {@code contract.evaluateTransaction()} in the
     * Fabric Gateway SDK — it queries the peer's world state without
     * submitting a transaction to the orderer.
     *
     * @param functionName the query function to invoke
     * @param args         arguments for the query
     * @return the query result
     */
    public Object evaluateTransaction(String functionName, Map<String, String> args) {
        log.info("[Gateway] evaluateTransaction: {} on channel '{}'",
                functionName, networkConfig.getChannelName());

        return switch (functionName) {
            case "queryEvidence" -> {
                String evidenceId = requireArg(args, "evidenceId");
                yield ledgerContract.queryEvidence(evidenceId);
            }
            case "queryCustodyTrail" -> {
                String evidenceId = requireArg(args, "evidenceId");
                yield ledgerContract.queryCustodyTrail(evidenceId);
            }
            case "queryAccessAuditLog" -> {
                String evidenceId = requireArg(args, "evidenceId");
                yield ledgerContract.queryAccessAuditLog(evidenceId);
            }
            case "getWorldStateStats" -> worldStateStore.getWorldStateStats();
            default -> throw new IllegalArgumentException(
                    "Unknown query function: " + functionName);
        };
    }

    // ── Convenience Methods ─────────────────────────────────────────────────

    /**
     * Register evidence on the ledger with minimal parameters.
     */
    public ChaincodeResponse registerEvidence(String evidenceId, String fileHash,
                                               String title, String caseId,
                                               String uploaderRole) {
        Map<String, String> args = new LinkedHashMap<>();
        args.put("evidenceId", evidenceId);
        args.put("fileHash", fileHash);
        args.put("title", title);
        args.put("caseId", caseId);
        args.put("uploaderRole", uploaderRole);
        return submitTransaction("registerEvidence", args);
    }

    /**
     * Transfer custody using role names (auto-resolves to MSP IDs).
     */
    public ChaincodeResponse transferCustody(String evidenceId,
                                              String fromRole, String toRole,
                                              String reason) {
        Map<String, String> args = new LinkedHashMap<>();
        args.put("evidenceId", evidenceId);
        args.put("fromRole", fromRole);
        args.put("toRole", toRole);
        args.put("reason", reason);
        return submitTransaction("transferCustody", args);
    }

    /**
     * Log an access audit event.
     */
    public ChaincodeResponse logAccessAudit(String evidenceId, String userId,
                                             String role, String accessType) {
        Map<String, String> args = new LinkedHashMap<>();
        args.put("evidenceId", evidenceId);
        args.put("userId", userId);
        args.put("role", role);
        args.put("accessType", accessType);
        return submitTransaction("grantAccessAudit", args);
    }

    /**
     * Verify a file hash against the ledger record.
     *
     * @param evidenceId   the evidence to verify
     * @param uploadedHash the hash computed from the uploaded file
     * @return verification result map
     */
    public Map<String, Object> verifyFileHash(String evidenceId, String uploadedHash) {
        Map<String, Object> state = ledgerContract.queryEvidence(evidenceId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("evidenceId", evidenceId);
        result.put("uploadedHash", uploadedHash);

        if (state == null) {
            result.put("verified", false);
            result.put("status", "NOT_FOUND");
            result.put("message", "Evidence not found in ledger");
            return result;
        }

        String ledgerHash = (String) state.get("fileHash");
        boolean matches = uploadedHash != null && uploadedHash.equalsIgnoreCase(ledgerHash);

        result.put("ledgerHash", ledgerHash);
        result.put("verified", matches);
        result.put("status", matches ? "VERIFIED" : "HASH_MISMATCH");
        result.put("message", matches
                ? "Chain of Custody Verified ✓ — File hash matches ledger record"
                : "ALERT: File hash does NOT match ledger record — possible tampering detected");
        result.put("custodyTrailLength", ledgerContract.queryCustodyTrail(evidenceId).size());
        result.put("currentBlockHeight", worldStateStore.getCurrentBlockHeight());

        return result;
    }

    // ── Internal Helpers ────────────────────────────────────────────────────

    private String requireArg(Map<String, String> args, String key) {
        String value = args.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Required argument missing: " + key);
        }
        return value;
    }
}
