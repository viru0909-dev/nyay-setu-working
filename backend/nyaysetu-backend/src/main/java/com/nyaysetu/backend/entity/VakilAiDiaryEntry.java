package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity to log all Vakil Friend AI interactions to the Case Diary.
 * Each entry is protected with SHA-256 hash for integrity verification.
 */
@Entity
@Table(name = "vakil_ai_diary_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VakilAiDiaryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID caseId;

    @Column(nullable = false)
    private UUID sessionId;

    @Column(nullable = false)
    private Long userId;

    @Column(columnDefinition = "TEXT")
    private String userQuery;

    @Column(columnDefinition = "TEXT")
    private String aiResponse;

    @Column(length = 64)
    private String contentHash; // SHA-256 hash of (userQuery + aiResponse)

    @Column(length = 50)
    private String entryType; // CHAT, DOCUMENT_ANALYSIS, CASE_ADVICE

    @Column(columnDefinition = "TEXT")
    private String attachedDocumentName;

    private String attachedDocumentHash; // SHA-256 of attached document

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private boolean verified; // Whether hash has been verified

    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON metadata for additional context
}
