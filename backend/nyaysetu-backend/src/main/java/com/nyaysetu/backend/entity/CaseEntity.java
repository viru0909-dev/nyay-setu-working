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

    @Enumerated(EnumType.STRING)
    private CaseStage stage;

    @Enumerated(EnumType.STRING)
    private DocumentStatus documentStatus;

    private String urgency; // NORMAL, URGENT, CRITICAL

    private String petitioner;

    private String respondent;

    private LocalDateTime filedDate;

    private LocalDateTime nextHearing;

    private String assignedJudge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User lawyer;

    private Long judgeId;

    private String filingMethod; // VAKIL_FRIEND, MANUAL

    private Long sourceFirId;

    private Boolean hasBsaCert;
    
    private String summonsStatus; // PENDING, SERVED, FAILED


    // ===== AI-RELATED FIELDS (Vakil-Friend System) =====
    
    @Column(columnDefinition = "TEXT")
    private String aiGeneratedSummary;

    @Column(columnDefinition = "TEXT")
    private String draftPetition;

    @Column(columnDefinition = "TEXT")
    private String judgeSummaryJson;

    @Column(columnDefinition = "TEXT")
    private String chatTranscript;

    private String evidenceVerificationStatus; // PENDING, VERIFIED, FAILED, NEEDS_REVIEW

    private Double aiConfidenceScore;

    private String lawyerProposalStatus; // PENDING, ACCEPTED, REJECTED

    // ===== JUDICIAL WORKFLOW FIELDS =====
    
    /**
     * Whether summons have been successfully delivered to all parties
     */
    private Boolean summonsDelivered;
    
    /**
     * Whether Section 63(4) BSA 2023 certification is complete
     * (Device Logs, User ID, SHA-256 Hash verified by Groq)
     */
    private Boolean bsa634Certified;
    
    /**
     * Draft approval status from litigant
     * Values: AWAITING_CLIENT, APPROVED, REJECTED, NOT_APPLICABLE
     */
    private String draftApprovalStatus;
    
    /**
     * Current stage in the Judge's 7-step judicial process:
     * 1 = Cognizance, 2 = Summons, 3 = Appearance, 4 = Evidence, 
     * 5 = Arguments, 6 = Judgment, 7 = Verdict
     */
    private Integer currentJudicialStage;
    
    /**
     * Blocking errors from Groq validation (prevents trial ready status)
     */
    @Column(columnDefinition = "TEXT")
    private String blockingErrors;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    
    // ===== COMPUTED PROPERTIES =====
    
    /**
     * Case is TRIAL_READY only when:
     * 1. Summons have been delivered (summonsDelivered == true)
     * 2. BSA Section 63(4) is certified (bsa634Certified == true)
     * 3. No blocking validation errors exist
     */
    @Transient
    public boolean isTrialReady() {
        return Boolean.TRUE.equals(summonsDelivered) 
            && Boolean.TRUE.equals(bsa634Certified)
            && (blockingErrors == null || blockingErrors.isEmpty());
    }
    
    /**
     * Whether the case can proceed to court submission
     * (Litigant must have approved the draft)
     */
    @Transient
    public boolean canSubmitToCourt() {
        return "APPROVED".equals(draftApprovalStatus);
    }
    
    /**
     * Get the health status of the case
     */
    @Transient
    public String getCaseHealth() {
        if (blockingErrors != null && !blockingErrors.isEmpty()) {
            return "BLOCKED";
        }
        if (!Boolean.TRUE.equals(bsa634Certified)) {
            return "NEEDS_CERTIFICATION";
        }
        if (!Boolean.TRUE.equals(summonsDelivered)) {
            return "AWAITING_SUMMONS";
        }
        if (!"APPROVED".equals(draftApprovalStatus) && draftApprovalStatus != null) {
            return "AWAITING_APPROVAL";
        }
        return "HEALTHY";
    }

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
