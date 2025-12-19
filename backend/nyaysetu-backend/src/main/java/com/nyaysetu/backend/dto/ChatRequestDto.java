package com.nyaysetu.backend.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequestDto {
    private String message;
    private UUID sessionId;
    private List<ChatMessageDto> conversationHistory;
}
