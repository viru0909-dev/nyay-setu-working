package com.nyaysetu.backend.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCommentRequest {
    private UUID caseId;
    private UUID userId;
    private String content;
}