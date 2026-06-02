package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CreateFeedbackRequest;
import com.nyaysetu.backend.entity.Feedback;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.FeedbackService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@Tag(name = "Feedback", description = "Endpoints for submitting and managing user feedback")
@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
@Slf4j
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> submitFeedback(
            @Valid @RequestBody CreateFeedbackRequest request,
            Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required to submit feedback"));
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Feedback saved = feedbackService.submitFeedback(request, user);
        log.info("Feedback submitted by user: {}", email);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Feedback submitted successfully",
                "id", saved.getId()
        ));
    }
}
