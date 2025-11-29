package com.nyaysetu.aiservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class ChatRequest {
    private String message;
}
