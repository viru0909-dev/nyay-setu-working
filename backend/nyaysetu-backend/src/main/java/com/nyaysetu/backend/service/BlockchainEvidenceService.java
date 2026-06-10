package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.*;
import com.nyaysetu.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Blockchain-secured evidence management service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BlockchainEvidenceService {

    private final EvidenceRecordRepository evidenceRepository;
    private final CaseRepository caseRepository;
    private final BlockchainService blockchainService;
    private final FileStorageService fileStorageService;
    private final EvidenceAnchoringService anchoringService;

    /**
     * Upload new evidence with blockchain security
     */
    @Transactional
    public EvidenceRecord uploadEvidence(UUID caseId, MultipartFile file, 
                                          String title, String description,
                                          String evidenceType, User uploadedBy, String uploadIp) {
        log.info("Uploading blockchain-secured evidence '{}' for case {}", title, caseId);

        // Find case
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found: " + caseId));

        // Store file
        String storedPath = fileStorageService.storeFile(file, "EVIDENCE");
        File storedFile = fileStorageService.getFile(storedPath);

        // Calculate file hash
        String fileHash = blockchainService.calculateFileHash(storedFile);
        log.info("Calculated file hash: {}...", fileHash.substring(0, 16));

        // Get previous block in chain
        Optional<EvidenceRecord> lastBlock = evidenceRepository
                .findTopByCaseEntityIdOrderByBlockIndexDesc(caseId);
        
        String previousBlockHash = lastBlock.map(EvidenceRecord::getBlockHash)
                .orElse(blockchainService.getGenesisHash());
        int blockIndex = lastBlock.map(r -> r.getBlockIndex() + 1).orElse(0);

        // Create block hash
        LocalDateTime timestamp = LocalDateTime.now();
        String blockHash = blockchainService.createBlockHash(fileHash, previousBlockHash, timestamp, title);

        // Create evidence record
        EvidenceRecord record = EvidenceRecord.builder()
                .caseEntity(caseEntity)
                .title(title)
                .description(description)
                .evidenceType(evidenceType)
                .fileHash(fileHash)
                .blockHash(blockHash)
                .previousBlockHash(previousBlockHash)
                .blockIndex(blockIndex)
                .isVerified(true)
                .verificationStatus("VERIFIED")
                .uploadedBy(uploadedBy)
                .uploadedByRole(uploadedBy.getRole().name())
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .createdAt(timestamp)
                .uploadIp(uploadIp != null ? uploadIp : "UNKNOWN")
                .build();

        // Compute Merkle root from all block hashes (existing + new)
        List<EvidenceRecord> existingEvidence = evidenceRepository
                .findByCaseEntityIdOrderByBlockIndexAsc(caseId);
        List<String> allBlockHashes = new java.util.ArrayList<>(
                existingEvidence.stream().map(EvidenceRecord::getBlockHash).toList());
        allBlockHashes.add(blockHash);
        String merkleRoot = anchoringService.calculateMerkleRoot(allBlockHashes);

        // Anchor the Merkle root to an external timestamp service
        String anchorProof = anchoringService.anchorMerkleRoot(merkleRoot);

        // Apply anchoring data to the new record
        record.setMerkleRoot(merkleRoot);
        record.setExternalAnchorProof(anchorProof);
        record.setAnchoredAt(java.time.LocalDateTime.now());
        record.setAnchorService(EvidenceAnchoringService.class.getSimpleName());

        EvidenceRecord saved = evidenceRepository.save(record);

        // Update all existing records with the new Merkle root
        for (EvidenceRecord ev : existingEvidence) {
            ev.setMerkleRoot(merkleRoot);
            ev.setExternalAnchorProof(anchorProof);
            ev.setAnchoredAt(java.time.LocalDateTime.now());
            ev.setAnchorService(EvidenceAnchoringService.class.getSimpleName());
        }
        if (!existingEvidence.isEmpty()) {
            evidenceRepository.saveAll(existingEvidence);
        }

        log.info("Evidence uploaded with block hash: {}..., index: {}, Merkle root: {}...",
                 blockHash.substring(0, 16), blockIndex, merkleRoot.substring(0, 16));

        return saved;
    }

    /**
     * Get all evidence for a case
     */
    public List<EvidenceRecord> getEvidenceByCase(UUID caseId) {
        return evidenceRepository.findByCaseEntityIdOrderByBlockIndexAsc(caseId);
    }

    /**
     * Verify integrity of a single evidence record
     */
    public Map<String, Object> verifyEvidence(UUID evidenceId) {
        EvidenceRecord record = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new RuntimeException("Evidence not found: " + evidenceId));

        Map<String, Object> result = new HashMap<>();
        result.put("evidenceId", evidenceId);
        result.put("title", record.getTitle());

        // Verify block hash
        boolean blockValid = blockchainService.verifyBlockIntegrity(
                record.getFileHash(),
                record.getPreviousBlockHash(),
                record.getCreatedAt(),
                record.getTitle(),
                record.getBlockHash()
        );
        result.put("blockIntegrity", blockValid);
        result.put("isValid", blockValid);
        result.put("status", blockValid ? "VERIFIED" : "TAMPERED");

        // Verify external anchor
        boolean anchorValid = false;
        if (record.getMerkleRoot() != null && record.getExternalAnchorProof() != null) {
            anchorValid = anchoringService.verifyAnchor(
                    record.getMerkleRoot(), record.getExternalAnchorProof());
        }
        result.put("anchorValid", anchorValid);

        boolean overallValid = blockValid && anchorValid;
        result.put("isValid", overallValid);
        result.put("status", overallValid ? "VERIFIED" : "TAMPERED");

        // Update record if status changed
        if (!overallValid && "VERIFIED".equals(record.getVerificationStatus())) {
            record.setVerificationStatus("TAMPERED");
            record.setIsVerified(false);
            evidenceRepository.save(record);
        }

        return result;
    }

    /**
     * Verify entire evidence chain for a case
     */
    public Map<String, Object> verifyChain(UUID caseId) {
        List<EvidenceRecord> chain = evidenceRepository.findByCaseEntityIdOrderByBlockIndexAsc(caseId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("caseId", caseId);
        result.put("totalRecords", chain.size());
        
        if (chain.isEmpty()) {
            result.put("isValid", true);
            result.put("message", "No evidence records found");
            return result;
        }

        List<Map<String, Object>> blockResults = new ArrayList<>();
        boolean chainValid = true;
        String expectedPreviousHash = blockchainService.getGenesisHash();

        for (EvidenceRecord record : chain) {
            Map<String, Object> blockResult = new HashMap<>();
            blockResult.put("blockIndex", record.getBlockIndex());
            blockResult.put("title", record.getTitle());

            // Verify chain link
            boolean linkValid = expectedPreviousHash.equals(record.getPreviousBlockHash());
            blockResult.put("chainLinkValid", linkValid);

            // Verify block hash
            boolean hashValid = blockchainService.verifyBlockIntegrity(
                    record.getFileHash(),
                    record.getPreviousBlockHash(),
                    record.getCreatedAt(),
                    record.getTitle(),
                    record.getBlockHash()
            );
            blockResult.put("hashValid", hashValid);
            blockResult.put("isValid", linkValid && hashValid);
            blockResults.add(blockResult);

            if (!linkValid || !hashValid) {
                chainValid = false;
            }

            expectedPreviousHash = record.getBlockHash();
        }

        // Verify against external anchor (check most recent record's proof)
        String merkleRoot = anchoringService.calculateMerkleRoot(
                chain.stream().map(EvidenceRecord::getBlockHash).toList());
        EvidenceRecord lastRecord = chain.get(chain.size() - 1);
        boolean anchorValid = false;
        if (lastRecord.getExternalAnchorProof() != null) {
            anchorValid = anchoringService.verifyAnchor(merkleRoot, lastRecord.getExternalAnchorProof());
        }
        result.put("anchorValid", anchorValid);
        result.put("merkleRoot", merkleRoot);

        boolean overallValid = chainValid && anchorValid;
        result.put("isValid", overallValid);
        result.put("message", overallValid ? "Chain integrity verified with external anchor ✓"
                : "Chain integrity compromised!");
        if (!anchorValid) {
            result.put("anchorWarning", "External anchor proof is missing or invalid — "
                    + "evidence may not meet BSA 63(4) requirements");
        }

        return result;
    }

    /**
     * Get evidence by ID
     */
    public EvidenceRecord getEvidenceById(UUID evidenceId) {
        return evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new RuntimeException("Evidence not found: " + evidenceId));
    }

    /**
     * Get evidence count for a case
     */
    public long getEvidenceCount(UUID caseId) {
        return evidenceRepository.countByCaseEntityId(caseId);
    }
}
