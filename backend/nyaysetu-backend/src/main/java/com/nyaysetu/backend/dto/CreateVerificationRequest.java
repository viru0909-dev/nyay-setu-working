package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreateVerificationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Requested role is required")
    private String requestedRole;

    private List<String> documentUrls; // optional
}
