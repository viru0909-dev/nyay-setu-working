package com.nyaysetu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    private String message;
    private String language; // e.g., "en", "hi", "mr", "ta"
    private String audioData; // Base64 encoded audio
}
