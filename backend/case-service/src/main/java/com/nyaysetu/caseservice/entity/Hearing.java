package com.nyaysetu.caseservice.entity;

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
public class Hearing {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID legalCaseId;

    private LocalDateTime scheduledAt;

    private String location;

    private String notes;
}