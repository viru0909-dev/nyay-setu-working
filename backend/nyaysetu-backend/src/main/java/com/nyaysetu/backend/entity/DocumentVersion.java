package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentVersion {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID documentId;

    private Integer versionNumber;

    private String uploadedBy;

    private LocalDateTime uploadedAt;

    private String fileHash;
    private Boolean isVerified;

    @Column(columnDefinition = "TEXT")
    private String notes;
}