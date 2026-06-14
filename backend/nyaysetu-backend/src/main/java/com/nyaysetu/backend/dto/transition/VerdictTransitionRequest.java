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
    private static final int VERDICT_MIN_LENGTH = 10;
    private static final int VERDICT_MAX_LENGTH = 10000;

    @NotBlank(message = "Verdict summary is required")
    @Size(min = VERDICT_MIN_LENGTH, max = VERDICT_MAX_LENGTH, message = "Verdict summary must be between 10 and 10000 characters")
    private String verdictSummary;
    @NotNull(message = "Judge ID is required")
    private Long judgeId;
    @NotBlank(message = "Judge name is required")
    private String judgeName;
    private String orderDetails;
}
