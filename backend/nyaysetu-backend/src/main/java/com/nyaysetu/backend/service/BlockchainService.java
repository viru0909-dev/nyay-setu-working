package com.nyaysetu.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

/**
 * Blockchain Service for evidence integrity
 * Uses SHA-256 hashing to create tamper-proof chain of evidence
 */
@Service
@Slf4j
public class BlockchainService {

    private static final String GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

    /**
     * Calculate SHA-256 hash of a file
     */
    public String calculateFileHash(File file) {
        try (FileInputStream fis = new FileInputStream(file)) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int bytesRead;
            
            while ((bytesRead = fis.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }
            
            return bytesToHex(digest.digest());
        } catch (IOException | NoSuchAlgorithmException e) {
            log.error("Failed to calculate file hash", e);
            throw new RuntimeException("Hash calculation failed", e);
        }
    }

    /**
     * Calculate SHA-256 hash of a string
     */
    public String calculateHash(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not found", e);
            throw new RuntimeException("Hash calculation failed", e);
        }
    }

    /**
     * Create a block hash from evidence data
     * Block hash = SHA-256(fileHash + previousBlockHash + timestamp + title)
     */
    public String createBlockHash(String fileHash, String previousBlockHash, 
                                   LocalDateTime timestamp, String title) {
        String previousHash = previousBlockHash != null ? previousBlockHash : GENESIS_HASH;
        String dataToHash = (fileHash != null ? fileHash : "") 
                          + previousHash 
                          + timestamp.toString() 
                          + title;
        
        String blockHash = calculateHash(dataToHash);
        log.info("Created block hash: {} for title: {}", blockHash.substring(0, 16) + "...", title);
        return blockHash;
    }

    /**
     * Get genesis hash for the first block in a case chain
     */
    public String getGenesisHash() {
        return GENESIS_HASH;
    }

    /**
     * Verify file integrity by comparing stored hash with current file hash
     */
    public boolean verifyFileIntegrity(File file, String storedHash) {
        if (storedHash == null || storedHash.isEmpty()) {
            return true; // No file hash stored, skip file verification
        }
        
        String currentHash = calculateFileHash(file);
        boolean isValid = storedHash.equals(currentHash);
        
        if (!isValid) {
            log.warn("File integrity check FAILED! Stored: {}, Current: {}", 
                     storedHash.substring(0, 16), currentHash.substring(0, 16));
        }
        
        return isValid;
    }

    /**
     * Verify block integrity by recalculating block hash
     */
    public boolean verifyBlockIntegrity(String fileHash, String previousBlockHash,
                                         LocalDateTime timestamp, String title,
                                         String storedBlockHash) {
        String calculatedHash = createBlockHash(fileHash, previousBlockHash, timestamp, title);
        boolean isValid = calculatedHash.equals(storedBlockHash);
        
        if (!isValid) {
            log.warn("Block integrity check FAILED! Evidence may have been tampered with!");
        }
        
        return isValid;
    }

    /**
     * Convert bytes to hexadecimal string
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
