package com.nyaysetu.userverificationservice.service;

import com.nyaysetu.userverificationservice.dto.CreateVerificationRequest;
import com.nyaysetu.userverificationservice.entity.VerificationRequest;
import com.nyaysetu.userverificationservice.entity.VerificationStatus;
import com.nyaysetu.userverificationservice.repository.VerificationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final VerificationRequestRepository repository;
    private final WebClient webClient;

    public VerificationRequest createRequest(CreateVerificationRequest dto) {
        var request = VerificationRequest.builder()
                .userId(dto.getUserId())
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
        VerificationRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        request.setStatus(VerificationStatus.APPROVED);
        request.setVerifiedAt(LocalDateTime.now());
        
        // Call Auth Service
        webClient.post()
                .uri("http://localhost:8080/auth/internal/update-role")
                .bodyValue(Map.of(
                        "userId", request.getUserId(),
                        "role", request.getRequestedRole()
                ))
                .retrieve()
                .toBodilessEntity()
                .block();

        return repository.save(request);
    }

    public VerificationRequest reject(UUID id) {
        var request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        request.setStatus(VerificationStatus.REJECTED);
        request.setVerifiedAt(LocalDateTime.now());
        
        return repository.save(request);
    }
}
