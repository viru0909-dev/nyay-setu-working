package com.nyaysetu.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateCaseRequest {
    private String title;
    private String description;
    private String caseType; // CIVIL, CRIMINAL, FAMILY, PROPERTY, COMMERCIAL
    private String petitioner;
    private String respondent;
    private String urgency; // NORMAL, URGENT, CRITICAL
}