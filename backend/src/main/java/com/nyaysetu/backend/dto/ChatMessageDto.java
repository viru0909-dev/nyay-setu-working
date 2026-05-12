package com.nyaysetu.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private String role; // "user" or "assistant"
    private String content;
    private LocalDateTime timestamp;
}
