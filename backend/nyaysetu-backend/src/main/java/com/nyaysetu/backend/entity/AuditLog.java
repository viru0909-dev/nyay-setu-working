package com.nyaysetu.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Long userId;          // user who did the action
    private UUID caseId;          // Link to case
    private String role;          // User role (JUDGE, POLICE, etc.)
    private String action;        // LOGIN, CASE_CREATED, DOC_UPLOADED
    private String description;   // details
    private LocalDateTime timestamp;
}
