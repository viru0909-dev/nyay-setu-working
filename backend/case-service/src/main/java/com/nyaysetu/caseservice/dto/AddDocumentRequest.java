package com.nyaysetu.caseservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddDocumentRequest {
    private String url;
    private String name;
}