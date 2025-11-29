package com.nyaysetu.documentservice.entity;

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

    private UUID caseId;

    private String fileName;

    private String fileUrl;

    private String contentType;

    private long size;

    private UUID uploadedBy;

    private LocalDateTime uploadedAt;

    @Enumerated(EnumType.STRING)
    private DocumentStorageType storageType;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
