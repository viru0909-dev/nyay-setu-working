package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespondentDetailsDTO {

    @NotBlank(message = "Respondent name is required")
    private String respondentName;

    @Email(message = "Invalid email format")
    private String respondentEmail;   // optional, validated if provided

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String respondentPhone;   // optional, validated if provided

    private String respondentAddress;     // optional
    private Boolean respondentIdentified; // optional
}
