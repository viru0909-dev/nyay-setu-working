package com.nyaysetu.backend.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OllamaChatResponse {
    private String response;
    private String model;
    private boolean fromOllama;
    private String status; // "online", "offline", "fallback"
    private Long totalDuration; // Duration in nanoseconds
}
