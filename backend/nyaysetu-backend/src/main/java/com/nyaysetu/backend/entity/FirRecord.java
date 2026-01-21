package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "fir_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FirRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String firNumber;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, length = 64)
    private String fileHash; // SHA-256 hash (64 hex characters)
    
    private String filePath;
    
    private String fileName;
    
    private String fileType;
    
    private Long fileSize;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;
    
    @Column(nullable = false)
    private LocalDateTime uploadedAt;
    
    // Optional link to a case
    private UUID caseId;
    
    @Column(nullable = false)
    private String status; // SEALED, LINKED_TO_CASE, VERIFIED
    
    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (status == null) {
            status = "SEALED";
        }
    }
}
