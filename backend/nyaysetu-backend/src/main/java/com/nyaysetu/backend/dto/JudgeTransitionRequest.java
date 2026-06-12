// JudgeTransitionRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JudgeTransitionRequest {
    @NotNull(message = "Judge id is required")
    @Positive(message = "Judge id must be positive")
    private Long judgeId;

    @NotBlank(message = "Judge name is required")
    @Size(max = 100)
    private String judgeName;
}