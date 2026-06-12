package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * AI-analyzed evidence vault record.
 *
 * Stores uploaded evidence metadata, SHA-256 verification, AI analysis,
 * validity assessment, and secure-vault state.
 *
 * EvidenceRecord remains the append-only blockchain audit-chain record.
 */

@Entity
@Table(name = "case_evidence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseEvidence {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false)
    private CaseEntity caseEntity;

    private String fileName;

    private String fileUrl;

    private Long uploadedBy;

    // ===== SHA-256 Protection Fields =====
    @Column(name = "sha256_hash", length = 64)
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

    @Version
    private Long version;
}