package com.nyaysetu.backend.dto;

import lombok.Data;

@Data
public class CreateVerificationRequest {
    private String email;
    private String userId;
    private String requestedRole;
    private java.util.List<String> documentUrls;
}
