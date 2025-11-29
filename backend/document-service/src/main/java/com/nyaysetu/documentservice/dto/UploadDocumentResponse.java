package com.nyaysetu.documentservice.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadDocumentResponse {
    private UUID id;
    private String fileName;
    private String fileUrl;
    private String contentType;
    private long size;
}
