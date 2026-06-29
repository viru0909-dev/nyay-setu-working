package com.nyaysetu.backend.feedback.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String userName;

    private String userEmail;

    private String category;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String message;

    private Integer rating;

    @Column(name = "screenshot_path")
    private String screenshotPath;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
