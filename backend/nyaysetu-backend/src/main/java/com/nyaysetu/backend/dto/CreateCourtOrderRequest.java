// CreateCourtOrderRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateCourtOrderRequest {
    @NotNull(message = "Case id is required")
    private UUID caseId;

    @NotBlank(message = "Order type is required")
    @Size(max = 100)
    private String orderType;

    @NotBlank(message = "Content is required")
    @Size(max = 50000)
    private String content;
}