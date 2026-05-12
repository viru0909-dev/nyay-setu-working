package com.nyaysetu.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceDto {
    private Long id;
    private String fileUrl;
    private String fileName;
    private String uploadedBy;
    private String fileType;
    private LocalDateTime uploadedAt;
}