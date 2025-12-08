package com.nyaysetu.backend.dto;

import com.nyaysetu.backend.entity.CaseStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CaseDTO {
    private UUID id;
    private String title;
    private String description;
    private String caseType;
    private CaseStatus status;
    private String urgency;
    private String petitioner;
    private String respondent;
    private LocalDateTime filedDate;
    private LocalDateTime nextHearing;
    private String assignedJudge;
    private Long clientId; // Changed from UUID to Long
    private String clientName;
    private int documentsCount;
}
