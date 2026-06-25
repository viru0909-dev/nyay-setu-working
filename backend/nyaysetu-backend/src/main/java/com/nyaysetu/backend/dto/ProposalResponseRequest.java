package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Validated request contract data transfer object for proposal responses.
 * Enforces character constraints to prevent empty parameters from hitting cores.
 */
@Data
public class ProposalResponseRequest {

    @NotBlank(message = "Proposal response status mapping token string cannot be blank or empty.")
    @Size(min = 3, max = 20, message = "Status length configuration properties must stay between 3 and 20 characters.")
    private String status;
}
