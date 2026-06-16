package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {

    @NotBlank(message = "Message cannot be empty")
    private String message;

    private String ocrContext;  // optional
    private String language;    // e.g., "en", "hi", "mr", "ta" — optional
    private String audioData;   // Base64 encoded audio — optional
}
