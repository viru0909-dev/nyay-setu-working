// TakeCognizanceRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TakeCognizanceRequest {
    @NotNull(message = "Judge id is required")
    @Positive(message = "Judge id must be positive")
    private Long judgeId;
}