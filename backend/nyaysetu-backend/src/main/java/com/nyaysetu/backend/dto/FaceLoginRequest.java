package com.nyaysetu.backend.dto;

import lombok.Data;

@Data
public class FaceLoginRequest {
    private String email;
    private String faceDescriptor;  // JSON array of 128D face embeddings
}
