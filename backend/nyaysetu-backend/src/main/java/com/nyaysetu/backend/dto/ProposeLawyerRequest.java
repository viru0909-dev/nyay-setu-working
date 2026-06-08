// ProposeLawyerRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProposeLawyerRequest {
    @NotNull(message = "Lawyer id is required")
    @Positive(message = "Lawyer id must be positive")
    private Long lawyerId;
}