package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequestDto {

    @NotBlank(message = "Message cannot be empty")
    private String message;

    private UUID sessionId;                          // optional
    private List<ChatMessageDto> conversationHistory; // optional
}
