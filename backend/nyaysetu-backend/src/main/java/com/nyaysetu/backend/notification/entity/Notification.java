package com.nyaysetu.backend.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "notification")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // recipient

    private String title;
    @Column(length = 2000)
    private String message;

    private Boolean readFlag = false;

    private Instant createdAt = Instant.now();
}