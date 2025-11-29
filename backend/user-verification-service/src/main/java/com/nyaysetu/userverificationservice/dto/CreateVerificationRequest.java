package com.nyaysetu.userverificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateVerificationRequest {
    private UUID userId;
    private String requestedRole;
    private List<String> documentUrls;
}
