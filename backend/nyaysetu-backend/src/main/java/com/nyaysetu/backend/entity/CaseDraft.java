package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity tracking model that isolates unverified AI-generated legal collections
 * into a distinct staging draft state machine schema before user verification.
 */
@Entity
@Table(name = "case_drafts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "citizen_id", nullable = false)
    private String citizenId;

    @Column(name = "petitioner_name")
    private String petitionerName;

    @Column(name = "respondent_name")
    private String respondentName;

    @Column(name = "case_type")
    private String caseType;

    @Column(name = "jurisdiction")
    private String jurisdiction;

    @Column(name = "facts", length = 4000)
    private String facts;

    @Column(name = "relief_requested", length = 2000)
    private String reliefRequested;

    @Column(name = "status", nullable = false)
    private String status; // COLLECTING_INFORMATION, READY_FOR_REVIEW, CONFIRMED_FOR_FILING, FILED, REJECTED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "COLLECTING_INFORMATION";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

