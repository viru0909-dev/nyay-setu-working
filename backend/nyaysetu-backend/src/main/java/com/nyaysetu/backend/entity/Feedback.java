package com.nyaysetu.backend.entity;

import lombok.*;
import jakarta.persistence.*;
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

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "lawyer_id")
    private Long lawyerId;

    @Column(nullable = false, length = 1000)
    private String content;

    private Integer rating;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
