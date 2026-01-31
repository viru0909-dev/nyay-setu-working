package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "case_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseMessage {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID legalCaseId;
    private Long senderId;

    private String message;

    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'TEXT'")
    private String type; // TEXT, AUDIO, VIDEO_CALL, PHONE_CALL, FILE

    private String attachmentUrl;

    private LocalDateTime timestamp;
}