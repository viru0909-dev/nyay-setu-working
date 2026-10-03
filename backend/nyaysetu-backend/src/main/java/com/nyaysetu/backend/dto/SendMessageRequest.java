package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SendMessageRequest {

    @NotBlank(message = "Message cannot be empty")
    private String message;

    private String type;          // optional
    private String attachmentUrl; // optional
}