// UpdateSummonsRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateSummonsRequest {
    @NotNull(message = "Served flag is required")
    private Boolean served;
}