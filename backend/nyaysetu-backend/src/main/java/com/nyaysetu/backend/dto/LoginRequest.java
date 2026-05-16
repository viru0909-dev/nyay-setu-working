package com.nyaysetu.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class LoginRequest {
    @NotBlank(message="Email is required")
    @Email(message="Invalid email format")
    private String email;
    @NotBlank(message="Password required")
    private String password;
}