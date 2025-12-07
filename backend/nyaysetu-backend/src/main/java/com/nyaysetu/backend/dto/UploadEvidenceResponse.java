package com.nyaysetu.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadEvidenceResponse {
    private String fileName;
    private String url;
}