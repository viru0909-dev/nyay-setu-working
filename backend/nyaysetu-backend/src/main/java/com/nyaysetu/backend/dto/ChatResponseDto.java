package com.nyaysetu.backend.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDto {
    private String response;
    private UUID sessionId;
    private String status; // CONTINUE, READY_TO_FILE, ERROR
    private String nextStep; // Guidance for user
    private Boolean canFileCase; // True if enough info collected
}
