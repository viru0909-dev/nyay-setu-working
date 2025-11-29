package com.nyaysetu.userverificationservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "verification_request")
public class VerificationRequest {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID userId;

    private String requestedRole;

    @Enumerated(EnumType.STRING)
    private VerificationStatus status;

    @ElementCollection
    private List<String> documentUrls;

    private LocalDateTime createdAt;

    private LocalDateTime verifiedAt;
}
