// LawyerSaveDraftRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LawyerSaveDraftRequest {
    @NotBlank(message = "Lawyer id is required")
    @Size(max = 64)
    private String lawyerId;

    @NotBlank(message = "Lawyer name is required")
    @Size(max = 100)
    private String lawyerName;

    @NotBlank(message = "Draft content is required")
    @Size(max = 100000)
    private String draftContent;
}