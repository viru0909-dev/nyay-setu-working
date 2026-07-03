package com.nyaysetu.backend.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    private UUID CaseEntityId;
    private Long senderId;

    private String message;

    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'TEXT'")
    private String type; // TEXT, AUDIO, VIDEO_CALL, PHONE_CALL, FILE

    private String attachmentUrl;

    private LocalDateTime timestamp;
}