package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClientFirRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Incident date is required")
    private LocalDate incidentDate;

    @NotBlank(message = "Incident location is required")
    private String incidentLocation;

    private Boolean aiGenerated; // optional
    private String aiSessionId;  // optional
    private UUID caseId;         // optional
}
