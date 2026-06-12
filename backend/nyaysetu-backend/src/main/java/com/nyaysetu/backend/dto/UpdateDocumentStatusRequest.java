// UpdateDocumentStatusRequest.java
package com.nyaysetu.backend.dto;

import com.nyaysetu.backend.entity.DocumentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateDocumentStatusRequest {
    @NotNull(message = "Document status is required")
    private DocumentStatus status;
}