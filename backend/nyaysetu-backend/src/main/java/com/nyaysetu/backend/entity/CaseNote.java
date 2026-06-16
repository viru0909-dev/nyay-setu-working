package com.nyaysetu.backend.entity;

import lombok.*;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CaseNote {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    private UUID legalCaseId;

    private String content;

    private UUID createdBy;

    private LocalDateTime createdAt;
}
