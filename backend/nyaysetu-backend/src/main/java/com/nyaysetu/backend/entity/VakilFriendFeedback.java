package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity tracking model that persists user quality ratings, comments, and analytics metrics
 * for AI-generated legal assistance queries delivered by Vakil Friend.
 */
@Entity
@Table(name = "vakil_friend_feedback")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VakilFriendFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "query_id", nullable = false)
    private String queryId;

    @Column(name = "response_id", nullable = false)
    private String responseId;

    @Column(name = "feedback_type", nullable = false)
    private String feedbackType; // HELPFUL, NOT_HELPFUL

    @Column(name = "comment", length = 1000)
    private String comment;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }
}

