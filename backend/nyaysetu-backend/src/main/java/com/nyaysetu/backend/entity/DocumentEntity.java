package com.nyaysetu.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "case_id")
    private UUID caseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "documents"})
    private CaseEntity caseEntity;

    private String fileName;

    private String fileUrl;

    private String contentType;

    private long size;

    private Long uploadedBy;

    private LocalDateTime uploadedAt;

    @Enumerated(EnumType.STRING)
    private DocumentStorageType storageType;

    private String category; // LEGAL, EVIDENCE, CORRESPONDENCE, IDENTITY, OTHER

    @Column(length = 500)
    private String description;

    private String fileHash;

    private String uploadIp;
    
    // Access control: PUBLIC (all parties), RESTRICTED (uploader+lawyer+judge), SEALED (judge only)
    @Builder.Default
    private String visibilityLevel = "PUBLIC";

    @Builder.Default
    private Boolean isVerified = true;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
