package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UploadDocumentRequest {

    @NotBlank(message = "Document category is required")
    private String category;

    private String description; // optional
    private UUID caseId;        // optional
}
