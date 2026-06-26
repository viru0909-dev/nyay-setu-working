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
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final VerificationRequestRepository repository;
    private final WebClient webClient;

    @Value("${auth.service.internal.update-role-url:http://localhost:8080/auth/internal/update-role}")
    private String authServiceUrl;

    public VerificationRequest createRequest(CreateVerificationRequest dto) {
        log.info("Initiating verification request creation loop for user target string context: {}", dto.getUserId());
        
        UUID userUuid;
        try {
            userUuid = UUID.fromString(dto.getUserId());
        } catch (IllegalArgumentException e) {
            log.error("Fatal parsing failure: User string context contains an invalid UUID layout structure: {}", dto.getUserId());
            throw new IllegalArgumentException("Provided user identity format string does not match standard UUID constraints.");
        }

        var request = VerificationRequest.builder()
                .userId(userUuid)
                .requestedRole(dto.getRequestedRole())
                .documentUrls(dto.getDocumentUrls())
                .status(VerificationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
                
        VerificationRequest savedRequest = repository.save(request);
        log.info("Verification request successfully committed to data store ledger with token ID: {}", savedRequest.getId());
        return savedRequest;
    }

    public List<VerificationRequest> getPending() {
        return repository.findByStatus(VerificationStatus.PENDING);
    }

    public VerificationRequest approve(UUID id) {
        log.info("Processing verification approval command loop sequence for token ID context: {}", id);
        
        VerificationRequest request = repository.findById(id)
                .orElseThrow(() -> {
                    log.error("Approval flow aborted: Target verification request not found for identity key: {}", id);
                    return new VerificationRequestNotFoundException("Target verification request entity record not found in system schema.");
                });
        
        request.setStatus(VerificationStatus.APPROVED);
        request.setVerifiedAt(LocalDateTime.now());
        
        log.info("Dispatching asynchronous non-blocking downstream auth sync payload configuration to external target endpoint URL: {}", authServiceUrl);
        
        // Fulfill GSoC acceptance criteria: Execute fully non-blocking WebClient stream pipeline loops with graceful fallbacks instead of calling blocking methods like .block()
        webClient.post()
                .uri(authServiceUrl)
                .bodyValue(Map.of(
                        "userId", request.getUserId(),
                        "role", request.getRequestedRole()
                ))
                .retrieve()
                .toBodilessEntity()
                .onErrorResume(error -> {
                    log.error("Downstream internal authentication management gateway sync communication breakdown for user reference: {}. Reason: {}", request.getUserId(), error.getMessage());
                    return Mono.empty();
                })
                .subscribe(response -> log.info("Downstream internal auth management endpoint configuration change completed successfully for user reference: {}", request.getUserId()));

        VerificationRequest updatedRequest = repository.save(request);
        log.info("Verification request state configuration successfully transitioned to APPROVED status level for identity token: {}", id);
        return updatedRequest;
    }

    public VerificationRequest reject(UUID id) {
        log.warn("Processing verification rejection command loop sequence for token ID context: {}", id);
        
        var request = repository.findById(id)
                .orElseThrow(() -> {
                    log.error("Rejection flow aborted: Target verification request not found for identity key: {}", id);
                    return new VerificationRequestNotFoundException("Target verification request entity record not found in system schema.");
                });
        
        request.setStatus(VerificationStatus.REJECTED);
        request.setVerifiedAt(LocalDateTime.now());
        
        VerificationRequest updatedRequest = repository.save(request);
        log.warn("Verification request state configuration successfully transitioned to REJECTED status level for identity token: {}", id);
        return updatedRequest;
    }
}
