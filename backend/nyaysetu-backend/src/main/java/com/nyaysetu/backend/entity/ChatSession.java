package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // User relation for Vakil-Friend
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Conversation data as JSON (list of messages)
    @Column(columnDefinition = "TEXT")
    private String conversationData;

    // Legacy field - kept for backward compatibility
    @Column(columnDefinition = "TEXT")
    private String conversationHistory;

    @Enumerated(EnumType.STRING)
    private ChatSessionStatus status; // ACTIVE, COMPLETED, ABANDONED

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    // Reference to created case (if completed)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id")
    private CaseEntity caseEntity;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = ChatSessionStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
