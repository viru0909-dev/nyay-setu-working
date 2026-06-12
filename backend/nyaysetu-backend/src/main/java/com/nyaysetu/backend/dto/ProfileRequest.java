package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ProfileRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    private String address; // optional
    private String city;    // optional
    private String state;   // optional
    private String country; // optional

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phone;   // optional but validated if provided
}