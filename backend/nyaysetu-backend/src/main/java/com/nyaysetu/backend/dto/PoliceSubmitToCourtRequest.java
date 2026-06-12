// PoliceSubmitToCourtRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PoliceSubmitToCourtRequest {
    @NotBlank(message = "Officer id is required")
    @Size(max = 64)
    private String officerId;

    @NotBlank(message = "Officer name is required")
    @Size(max = 100)
    private String officerName;
}