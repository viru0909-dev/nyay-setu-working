// LitigantApproveDraftRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LitigantApproveDraftRequest {
    @NotBlank(message = "Litigant id is required")
    @Size(max = 64)
    private String litigantId;

    @NotBlank(message = "Litigant name is required")
    @Size(max = 100)
    private String litigantName;
}