package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
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

    private LocalDateTime timestamp;
}