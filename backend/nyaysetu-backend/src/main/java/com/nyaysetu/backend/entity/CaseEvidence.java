package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Case Evidence Entity with SHA-256 protection for Evidence Vault.
 * Documents stored here are cryptographically secured for legal validity.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseEvidence {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID legalCaseId;

    private String fileName;

    private String fileUrl;

    private Long uploadedBy;

    // ===== SHA-256 Protection Fields =====
    @Column(length = 64)
    private String sha256Hash; // SHA-256 hash for integrity verification

    @Column(length = 128)  
    private String originalHash; // Hash computed at upload time

    @Builder.Default
    private boolean hashVerified = false; // Whether hash has been verified

    private LocalDateTime hashVerifiedAt; // When hash was last verified

    // ===== AI Analysis Fields =====
    @Column(columnDefinition = "TEXT")
    private String aiAnalysisSummary; // AI-generated document summary

    @Column(length = 50)
    private String documentType; // AI-detected document type

    @Column(length = 30)
    private String validityStatus; // VALID, INVALID, PARTIALLY_VALID, REQUIRES_REVIEW

    @Column(columnDefinition = "TEXT")
    private String validityNotes; // Notes about validity

    @Column(length = 20)
    private String importance; // HIGH, MEDIUM, LOW (AI recommendation)

    @Column(length = 50)
    private String category; // EVIDENCE, PETITION, IDENTITY, FINANCIAL, MEDICAL, etc.

    @Builder.Default
    private boolean aiAnalyzed = false; // Whether AI has analyzed this document

    private LocalDateTime analyzedAt; // When AI analyzed the document

    // ===== Vault Storage Fields =====
    @Builder.Default
    private boolean storedInVault = false; // Whether stored in secure vault

    private LocalDateTime vaultStoredAt; // When stored in vault

    @Column(length = 100)
    private String vaultStorageReason; // Why it was stored in vault

    // ===== Metadata =====
    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();

    private Long fileSize; // Size in bytes

    @Column(length = 50)
    private String mimeType; // File MIME type

    @Column(columnDefinition = "TEXT")
    private String metadata; // Additional JSON metadata
}