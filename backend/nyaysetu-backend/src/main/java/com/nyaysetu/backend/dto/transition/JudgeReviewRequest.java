package com.nyaysetu.backend.dto.transition;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JudgeReviewRequest {
    
    @NotNull(message = "Judge ID is required")
    @Min(value = 1, message = "Judge ID must be positive")
    private Long judgeId;
    
    @NotBlank(message = "Judge name is required")
    @Pattern(regexp = "^[A-Za-z\\s]{2,100}$", message = "Judge name must be 2-100 characters")
    private String judgeName;
    
    private String remarks;
}
