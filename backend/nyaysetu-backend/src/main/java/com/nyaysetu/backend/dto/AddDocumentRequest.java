package com.nyaysetu.backend.dto;

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