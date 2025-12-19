package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "case_entity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    @Column(length = 2000)
    private String description;

    private String caseType; // CIVIL, CRIMINAL, FAMILY, PROPERTY, COMMERCIAL

    @Enumerated(EnumType.STRING)
    private CaseStatus status;

    private String urgency; // NORMAL, URGENT, CRITICAL

    private String petitioner;

    private String respondent;

    private LocalDateTime filedDate;

    private LocalDateTime nextHearing;

    private String assignedJudge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private User client;

    private UUID judgeId;

    // ===== AI-RELATED FIELDS (Vakil-Friend System) =====
    
    @Column(columnDefinition = "TEXT")
    private String aiGeneratedSummary;

    @Column(columnDefinition = "TEXT")
    private String judgeSummaryJson;

    @Column(columnDefinition = "TEXT")
    private String chatTranscript;

    private String evidenceVerificationStatus; // PENDING, VERIFIED, FAILED, NEEDS_REVIEW

    private Double aiConfidenceScore;

    private String filingMethod; // TRADITIONAL, CHAT_AI

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (filedDate == null) {
            filedDate = LocalDateTime.now();
        }
        if (status == null) {
            status = CaseStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
