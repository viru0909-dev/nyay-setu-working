package com.nyaysetu.backend.dto.transition;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HearingTransitionRequest {
    
    @NotNull(message = "Hearing date is required")
    @Future(message = "Hearing date must be in the future")
    private LocalDateTime hearingDate;
    
    private String hearingType;
    
    private String remarks;
    
    private String judgeRemarks;
}
