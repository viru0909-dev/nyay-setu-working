package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * CaseEvent - Immutable audit trail for all case actions.
 * Acts as the Single Source of Truth for the case lifecycle.
 * 
 * Every state transition, action, or modification creates an event entry.
 */
@Entity
@Table(name = "case_events", indexes = {
    @Index(name = "idx_case_events_case_id", columnList = "caseId"),
    @Index(name = "idx_case_events_timestamp", columnList = "timestamp"),
    @Index(name = "idx_case_events_event_type", columnList = "eventType")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID caseId;

    /**
     * Event type identifier:
     * - POLICE_SUBMIT: Police submits case to court
     * - LAWYER_DRAFT_SAVE: Lawyer saves a draft petition
     * - LITIGANT_APPROVE: Litigant approves a draft
     * - JUDGE_COGNIZANCE: Judge takes cognizance of case
     * - EVIDENCE_UPLOADED: New evidence added to vault
     * - BSA_VALIDATED: Groq validates Section 63(4) compliance
     * - BSA_FAILED: Groq validation failed (blocking)
     * - SUMMONS_ISSUED: Court issues summons
     * - SUMMONS_SERVED: Summons delivered to party
     * - HEARING_SCHEDULED: New hearing date set
     * - STATUS_CHANGE: Generic status transition
     * - STAGE_CHANGE: Judge advances case stage
     */
    @Column(nullable = false, length = 50)
    private String eventType;

    /**
     * Who triggered this event (User ID or system identifier)
     */
    private String actorId;

    /**
     * Role of the actor: POLICE, LAWYER, LITIGANT, JUDGE, SYSTEM
     */
    @Column(length = 20)
    private String actorRole;

    /**
     * Human-readable name of the actor for display
     */
    private String actorName;

    /**
     * Full JSON payload containing event details.
     * Structure varies by eventType.
     */
    @Column(columnDefinition = "TEXT")
    private String eventDataJson;

    /**
     * Previous case status before this event (for transitions)
     */
    @Enumerated(EnumType.STRING)
    private CaseStatus previousStatus;

    /**
     * New case status after this event
     */
    @Enumerated(EnumType.STRING)
    private CaseStatus newStatus;

    /**
     * Previous case stage (for stage transitions)
     */
    private Integer previousStage;

    /**
     * New case stage after this event
     */
    private Integer newStage;

    /**
     * Brief human-readable summary for timeline display
     */
    @Column(length = 500)
    private String summary;

    /**
     * IP address of the request (for audit purposes)
     */
    private String ipAddress;

    /**
     * Immutable timestamp of when the event occurred
     */
    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
