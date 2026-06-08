// SubmitDraftRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmitDraftRequest {
    @NotBlank(message = "Draft content is required")
    @Size(max = 100000)
    private String draftContent;
}