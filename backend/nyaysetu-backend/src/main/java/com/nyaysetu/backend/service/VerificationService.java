package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.CreateVerificationRequest;
import com.nyaysetu.backend.entity.VerificationRequest;
import com.nyaysetu.backend.entity.VerificationStatus;
import com.nyaysetu.backend.exception.VerificationRequestNotFoundException;
import com.nyaysetu.backend.repository.VerificationRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationService {

    private final VerificationRequestRepository repository;
    private final WebClient webClient;

    @Value("${auth.service.url}")
    private String authServiceUrl;

    public VerificationRequest createRequest(CreateVerificationRequest dto) {
        UUID userId;
        try {
            userId = UUID.fromString(dto.getUserId());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid userId format");
        }

        log.info("Creating verification request for user {}", userId);

        var request = VerificationRequest.builder()
                .userId(userId)
                .requestedRole(dto.getRequestedRole())
                .documentUrls(dto.getDocumentUrls())
                .status(VerificationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        return repository.save(request);
    }

    public List<VerificationRequest> getPending() {
        return repository.findByStatus(VerificationStatus.PENDING);
    }

    public VerificationRequest approve(UUID id) {
        log.info("Approving verification request {}", id);

        VerificationRequest request = repository.findById(id)
                .orElseThrow(() -> new VerificationRequestNotFoundException("Verification request not found: " + id));
        
        request.setStatus(VerificationStatus.APPROVED);
        request.setVerifiedAt(LocalDateTime.now());
        
        // Call Auth Service
        try {
            webClient.post()
                    .uri(authServiceUrl + "/auth/internal/update-role")
                    .bodyValue(Map.of(
                            "userId", request.getUserId(),
                            "role", request.getRequestedRole()
                    ))
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (WebClientResponseException ex) {
            log.error("Auth service error while updating role", ex);
            throw new RuntimeException("Failed to update role in Auth Service");
        }

        return repository.save(request);
    }

    public VerificationRequest reject(UUID id) {
        log.info("Rejecting verification request {}", id);

        var request = repository.findById(id)
                .orElseThrow(() -> new VerificationRequestNotFoundException("Verification request not found: " + id));
        
        request.setStatus(VerificationStatus.REJECTED);
        request.setVerifiedAt(LocalDateTime.now());
        
        return repository.save(request);
    }
}

