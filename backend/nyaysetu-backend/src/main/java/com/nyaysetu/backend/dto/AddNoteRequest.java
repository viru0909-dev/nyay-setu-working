package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AddNoteRequest {

    @NotNull(message = "Author ID is required")
    private UUID authorId;

    @NotBlank(message = "Note content cannot be empty")
    private String content;
}