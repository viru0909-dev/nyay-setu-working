package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Validated request contract data transfer object for case cognizance.
 * Enforces strict presence of judge identification to secure case docket transitions.
 */
@Data
public class CognizanceRequest {

    @NotNull(message = "Judge identification validation profile token key cannot be null or omitted.")
    private Long judgeId;
}
