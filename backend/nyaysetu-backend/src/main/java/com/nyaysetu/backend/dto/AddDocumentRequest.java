package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddDocumentRequest {

    @NotBlank(message = "Document URL is required")
    private String url;

    @NotBlank(message = "Document name is required")
    private String name;
}