// ReviewDraftRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewDraftRequest {
    @NotNull(message = "Approved flag is required")
    private Boolean approved;

    @Size(max = 2000)
    private String comments;
}