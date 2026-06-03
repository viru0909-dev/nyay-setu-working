package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateCommentRequest {

    @NotNull(message = "Case ID is required")
    private UUID caseId;

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Comment content cannot be empty")
    private String content;
}