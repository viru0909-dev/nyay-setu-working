package com.nyaysetu.backend.dto.transition;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerdictTransitionRequest {
    
    @NotBlank(message = "Verdict summary is required")
    @Size(min = 10, max = 10000, message = "Verdict summary must be between 10 and 10000 characters")
    private String verdictSummary;
    
    @NotNull(message = "Judge ID is required")
    private Long judgeId;
    
    @NotBlank(message = "Judge name is required")
    private String judgeName;
    
    private String orderDetails;
}
