package com.nyaysetu.caseservice.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SendMessageRequest {
    private UUID senderId;
    private String message;
}