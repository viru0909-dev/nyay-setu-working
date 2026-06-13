package com.nyaysetu.backend.dto.transition;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LitigantResponseRequest {
    
    @NotBlank(message = "Litigant ID is required")
    @Pattern(regexp = "^[A-Z0-9]{6,20}$", message = "Litigant ID must be 6-20 alphanumeric characters")
    private String litigantId;
    
    @NotBlank(message = "Litigant name is required")
    @Pattern(regexp = "^[A-Za-z\\s]{2,100}$", message = "Litigant name must be 2-100 characters")
    private String litigantName;
    
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason; // Required for reject, optional for approve
}
