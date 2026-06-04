package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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

    @NotEmpty(message = "Document URLs must not be empty")
    private List<String> documentUrls;
}

