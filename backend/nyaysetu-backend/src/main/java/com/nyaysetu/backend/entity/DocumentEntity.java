package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

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

    private UUID caseId;

    private String fileName;

    private String fileUrl;

    private String contentType;

    private long size;

    private Long uploadedBy;

    private LocalDateTime uploadedAt;

    @Enumerated(EnumType.STRING)
    private DocumentStorageType storageType;

    private String category;

    @Column(length = 500)
    private String description;

    private String fileHash;

    private String uploadIp;

    @Builder.Default
    private String visibilityLevel = "PUBLIC";

    @Builder.Default
    private Boolean isVerified = true;

    @ElementCollection
    @CollectionTable(
        name = "document_versions",
        joinColumns = @JoinColumn(name = "document_id")
    )
    private List<DocumentVersion> versions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}