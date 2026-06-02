package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateFeedbackRequest {

    private Long lawyerId;

    @NotBlank(message = "Feedback content cannot be empty")
    @Size(max = 1000, message = "Feedback content must not exceed 1000 characters")
    private String content;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private Integer rating;
}
