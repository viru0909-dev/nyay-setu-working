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
public class LawyerDraftRequest {
    private static final int DRAFT_MIN_LENGTH = 10;
    private static final int DRAFT_MAX_LENGTH = 50000;

    @NotBlank(message = "Lawyer ID is required")
    @Pattern(regexp = "^[A-Z0-9]{6,20}$", message = "Lawyer ID must be 6-20 alphanumeric characters")
    private String lawyerId;
    @NotBlank(message = "Lawyer name is required")
    @Pattern(regexp = "^[A-Za-z\\s]{2,100}$", message = "Lawyer name must be 2-100 characters")
    private String lawyerName;
    @NotBlank(message = "Draft content is required")
    @Size(min = DRAFT_MIN_LENGTH, max = DRAFT_MAX_LENGTH, message = "Draft content must be between 10 and 50000 characters")
    private String draftContent;
}
