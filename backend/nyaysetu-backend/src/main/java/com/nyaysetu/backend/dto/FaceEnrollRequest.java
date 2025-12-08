package com.nyaysetu.backend.dto;

import lombok.Data;

@Data
public class FaceEnrollRequest {
    private Long userId;
    private String faceDescriptor;  // JSON array of 128D face embeddings
}
