// DeliverVerdictRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeliverVerdictRequest {
    @Size(max = 20000)
    private String verdictDetails;
}