package com.nyaysetu.backend.dto.transition;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PoliceHandoffRequest {
    
    @NotBlank(message = "Officer ID is required")
    @Pattern(regexp = "^[A-Z0-9]{6,20}$", message = "Officer ID must be 6-20 alphanumeric characters")
    private String officerId;
    
    @NotBlank(message = "Officer name is required")
    @Pattern(regexp = "^[A-Za-z\\s]{2,100}$", message = "Officer name must be 2-100 characters")
    private String officerName;
    
    @NotBlank(message = "Remarks are required")
    private String remarks;
}
