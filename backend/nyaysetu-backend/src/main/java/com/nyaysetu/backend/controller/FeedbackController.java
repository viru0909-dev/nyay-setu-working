package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.feedback.entity.Feedback;
import com.nyaysetu.backend.feedback.service.FeedbackService;
import com.nyaysetu.backend.service.AuthService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final AuthService authService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Feedback> submitFeedback(
            Authentication authentication,
            @RequestParam @NotBlank String category,
            @RequestParam(required = false) String subject,
            @RequestParam @NotBlank String message,
            @RequestParam Integer rating,
            @RequestPart(name = "screenshot", required = false) MultipartFile screenshot
    ) {
        User user = authService.findByEmail(authentication.getName());
        Feedback saved = feedbackService.submitFeedback(user, category, subject, message, rating, screenshot);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Feedback>> getMyFeedback(Authentication authentication) {
        User user = authService.findByEmail(authentication.getName());
        return ResponseEntity.ok(feedbackService.getMyFeedback(user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }
}
