package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Evidence Record with blockchain security
 * Each record contains cryptographic hashes for tamper detection
 */
@Entity
@Table(name = "evidence_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private CaseEntity caseEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private DocumentEntity document;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String evidenceType; // DOCUMENT, IMAGE, AUDIO, VIDEO, TESTIMONY

    // Blockchain security fields
    @Column(name = "file_hash", length = 64)
    private String fileHash; // SHA-256 of file content

    @Column(name = "block_hash", length = 64, nullable = false)
    private String blockHash; // SHA-256 of (fileHash + previousBlockHash + timestamp)

    @Column(name = "previous_block_hash", length = 64)
    private String previousBlockHash; // Reference to previous record in chain

    @Column(name = "block_index")
    private Integer blockIndex; // Position in the chain

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = true;

    @Column(name = "verification_status")
    @Builder.Default
    private String verificationStatus = "VERIFIED"; // VERIFIED, TAMPERED, PENDING

    // Metadata
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(name = "uploaded_by_role")
    private String uploadedByRole; // CLIENT, LAWYER, JUDGE

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type")
    private String contentType;
}
