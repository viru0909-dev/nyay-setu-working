package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
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
    
    @Column(length = 64)
    private String fileHash; // SHA-256 hash (64 hex characters) - optional for client FIRs
    
    private String filePath;
    
    private String fileName;
    
    private String fileType;
    
    private Long fileSize;
    
    // Police who uploaded/processed (for police-uploaded FIRs)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;
    
    // Client who filed (for client-filed FIRs)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filed_by")
    private User filedBy;
    
    @Column(nullable = false)
    private LocalDateTime uploadedAt;
    
    // Incident details for client FIRs
    private LocalDate incidentDate;
    
    private String incidentLocation;
    
    // AI integration
    private Boolean aiGenerated;
    
    private String aiSessionId;
    
    // Optional link to a case
    private UUID caseId;
    
    // Status: PENDING_POLICE_REVIEW, SEALED, REGISTERED, REJECTED, LINKED_TO_CASE
    @Column(nullable = false)
    private String status;
    
    // Police review notes
    @Column(columnDefinition = "TEXT")
    private String reviewNotes;
    
    private LocalDateTime reviewedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    // Investigation Fields
    @Column(columnDefinition = "TEXT")
    private String investigationDetails;

    private LocalDateTime submittedToCourtAt;

    @Builder.Default
    private Boolean isSubmittedToCourt = false;
    
    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING_POLICE_REVIEW";
        }
        if (aiGenerated == null) {
            aiGenerated = false;
        }
    }
}

