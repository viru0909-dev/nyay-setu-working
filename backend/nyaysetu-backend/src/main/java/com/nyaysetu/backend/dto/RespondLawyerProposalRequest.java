// RespondLawyerProposalRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RespondLawyerProposalRequest {
    @NotNull(message = "Status is required")
    private LawyerProposalStatus status;
}