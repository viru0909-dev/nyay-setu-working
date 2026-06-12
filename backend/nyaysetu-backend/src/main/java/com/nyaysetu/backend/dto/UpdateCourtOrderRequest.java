// UpdateCourtOrderRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateCourtOrderRequest {
    @Size(max = 100)
    private String orderType;

    @Size(max = 50000)
    private String content;

    private CourtOrderStatus status;

    @AssertTrue(message = "At least one field must be provided")
    public boolean hasAtLeastOneField() {
        return orderType != null || content != null || status != null;
    }
}