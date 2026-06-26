package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Validated request contract data transfer object for lawyer proposals.
 * Satisfies strict Bean Validation criteria to prevent unvalidated field injection.
 */
@Data
public class LawyerProposalRequest {

    @NotNull(message = "Lawyer identification token key cannot be null or omitted.")
    private Long lawyerId;
}

