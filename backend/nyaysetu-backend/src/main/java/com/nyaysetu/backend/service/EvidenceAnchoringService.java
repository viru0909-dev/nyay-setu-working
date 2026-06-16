package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.EvidenceRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Evidence anchoring service — provides external, verifiable anchoring
 * for evidence Merkle roots.
 *
 * In production, this would integrate with OpenTimestamps (OTS) to
 * anchor hashes into the Bitcoin blockchain, or use RFC 3161 TSP.
 * This implementation provides a simulated anchor with all the
 * structural elements needed for a real implementation.
 */
@Service
@Slf4j
public class EvidenceAnchoringService {

    private static final String ANCHOR_SERVICE = "NyaySetu-Internal-Timestamp";

    /**
     * Calculate a Merkle root from a list of evidence block hashes.
     * Uses the standard Bitcoin-style Merkle tree construction
     * (pairwise SHA-256 hashing).
     */
    public String calculateMerkleRoot(List<String> blockHashes) {
        if (blockHashes == null || blockHashes.isEmpty()) {
            return "";
        }
        if (blockHashes.size() == 1) {
            return blockHashes.get(0);
        }

        List<String> currentLevel = new java.util.ArrayList<>(blockHashes);
        while (currentLevel.size() > 1) {
            List<String> nextLevel = new java.util.ArrayList<>();
            for (int i = 0; i < currentLevel.size(); i += 2) {
                String left = currentLevel.get(i);
                String right = (i + 1 < currentLevel.size()) ? currentLevel.get(i + 1) : left;
                nextLevel.add(doubleHash(left, right));
            }
            currentLevel = nextLevel;
        }
        return currentLevel.get(0);
    }

    private String doubleHash(String left, String right) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] combined = (left + right).getBytes(StandardCharsets.UTF_8);
            byte[] firstHash = digest.digest(combined);
            byte[] secondHash = digest.digest(firstHash);
            return bytesToHex(secondHash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    /**
     * Anchor a Merkle root to an external timestamp service.
     *
     * In production, this would call the OpenTimestamps API or an
     * RFC 3161 TSA to get a verifiable timestamp token.
     *
     * @param merkleRoot the Merkle root hash to anchor
     * @return a proof string that can later be verified
     */
    public String anchorMerkleRoot(String merkleRoot) {
        String proof = ANCHOR_SERVICE + "|" + Instant.now().toString() + "|"
                + UUID.randomUUID().toString() + "|" + merkleRoot;
        log.info("Anchored Merkle root {} via {} (proof: {}...)",
                merkleRoot.substring(0, 16), ANCHOR_SERVICE, proof.substring(0, 32));
        return proof;
    }

    /**
     * Verify an anchored proof against a Merkle root.
     *
     * In production, this would verify the OTS file or TST token
     * against the Bitcoin blockchain or TSA certificate chain.
     */
    public boolean verifyAnchor(String merkleRoot, String anchorProof) {
        if (anchorProof == null || anchorProof.isEmpty()) {
            log.warn("No anchor proof found for Merkle root: {}", merkleRoot != null ? merkleRoot.substring(0, 16) : "null");
            return false;
        }
        boolean isValid = anchorProof.contains(merkleRoot) && anchorProof.contains(ANCHOR_SERVICE);
        if (!isValid) {
            log.warn("Anchor proof verification FAILED for Merkle root: {}...", merkleRoot.substring(0, 16));
        }
        return isValid;
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
