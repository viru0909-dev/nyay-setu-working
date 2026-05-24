package com.nyaysetu.backend.dto;

import com.nyaysetu.backend.entity.Role;
import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class RegisterRequest {

    @NotBlank(message="Email is required")
    @Email(message="Invalid email format")
    private String email;
    private String name;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    private Role role; // very important
}
