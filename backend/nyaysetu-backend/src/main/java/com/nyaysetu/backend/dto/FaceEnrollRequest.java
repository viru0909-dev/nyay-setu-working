package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FaceEnrollRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Face descriptor is required")
    private String faceDescriptor;
}
