package com.nyaysetu.backend.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private UUID id;
    private UUID caseId;
    private UUID userId;
    private String content;
    private LocalDateTime createdAt;
}