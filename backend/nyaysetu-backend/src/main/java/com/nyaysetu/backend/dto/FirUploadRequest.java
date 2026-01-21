package com.nyaysetu.backend.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FirUploadRequest {
    private String title;
    private String description;
    private UUID caseId; // Optional - link to existing case
}
