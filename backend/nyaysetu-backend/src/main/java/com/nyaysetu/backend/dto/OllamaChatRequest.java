package com.nyaysetu.backend.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OllamaChatRequest {
    private String message;
    private String model; // Optional: specific model to use
    private String context; // Optional: additional context
}
