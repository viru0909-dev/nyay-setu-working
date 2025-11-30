package com.nyaysetu.caseservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDto {
    private Long id;
    private String url;
    private String name;
    private String uploadedBy;
    private String fileType;
}