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
}
