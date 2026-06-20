package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "court_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID caseId;

    @Column(nullable = false)
    private String orderType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String status; // DRAFT, ISSUED, FINAL

    private String issuedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime issuedAt;

    // ===== VERDICT DOCUMENTATION =====

    private String verdictType;

    @Column(columnDefinition = "TEXT")
    private String verdictSummary;

    private LocalDateTime verdictDate;

    @Builder.Default
    private Boolean archived = false;

    private String documentUrl;

    private String verdictReferenceNumber;

    private String approvedBy;

    @Builder.Default
    private Boolean digitallySigned = false;
}
