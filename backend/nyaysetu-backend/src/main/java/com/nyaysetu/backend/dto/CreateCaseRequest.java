package com.nyaysetu.backend.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateCaseRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Case type is required")
    private String caseType; // CIVIL, CRIMINAL, FAMILY, PROPERTY, COMMERCIAL

    @NotBlank(message = "Petitioner is required")
    private String petitioner;

    @NotBlank(message = "Respondent is required")
    private String respondent;

    private String urgency; // NORMAL, URGENT, CRITICAL
}