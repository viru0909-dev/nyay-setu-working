package com.nyaysetu.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SendMessageRequest {
    private Long senderId;
    private String message;
    private String type;
    private String attachmentUrl;
}