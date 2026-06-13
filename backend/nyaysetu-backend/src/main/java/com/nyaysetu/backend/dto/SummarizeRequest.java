package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SummarizeRequest {

    @NotBlank(message = "Text to summarize cannot be empty")
    private String text;
}
