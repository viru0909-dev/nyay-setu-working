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

        EvidenceRecord saved = evidenceRepository.save(record);
        log.info("Evidence uploaded with block hash: {}..., index: {}", 
                 blockHash.substring(0, 16), blockIndex);

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

        // Update record if status changed
        if (!blockValid && "VERIFIED".equals(record.getVerificationStatus())) {
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

        result.put("isValid", chainValid);
        result.put("blocks", blockResults);
        result.put("message", chainValid ? "Chain integrity verified ✓" : "Chain integrity compromised!");

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
