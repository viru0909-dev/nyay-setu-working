package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SendMessageRequest {

    @NotNull(message = "Sender ID is required")
    private Long senderId;

    @NotBlank(message = "Message cannot be empty")
    private String message;

    private String type;          // optional
    private String attachmentUrl; // optional
}