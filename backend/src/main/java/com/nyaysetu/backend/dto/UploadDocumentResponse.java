package com.nyaysetu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UploadDocumentResponse {
    private UUID id;
    private String filename;
    private String message;
    private String fileName;
    private String fileUrl;
    private String contentType;
    private Long size;
}
