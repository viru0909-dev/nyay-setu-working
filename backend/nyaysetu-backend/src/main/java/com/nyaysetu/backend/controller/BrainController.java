package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.NyaySetuBrainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for the Central AI Brain
 */
@RestController
@RequestMapping("/api/brain")
@RequiredArgsConstructor
@Slf4j
public class BrainController {

    private final NyaySetuBrainService brainService;
    private final UserRepository userRepository;

    /**
     * unified brain chat endpoint
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String message = request.get("message");
        String sessionIdStr = request.get("sessionId");
        UUID sessionId = (sessionIdStr != null && !sessionIdStr.isEmpty()) ? UUID.fromString(sessionIdStr) : null;

        User user = null;
        if (userDetails != null) {
            user = userRepository.findByEmail(userDetails.getUsername())
                    .orElse(null);
        }

        log.info("🧠 Brain request from role: {}, msg: {}", (user != null ? user.getRole() : "GUEST"), message);
        
        Map<String, Object> response = brainService.process(sessionId, message, user);
        return ResponseEntity.ok(response);
    }

    /**
     * Analyze case intent (FIR vs Court Case)
     */
    @PostMapping("/analyze-case")
    public ResponseEntity<Map<String, String>> analyzeCase(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        log.info("🧠 Brain Case Analysis request for: {}", query);
        Map<String, String> analysis = brainService.analyzeCaseIntent(query);
        return ResponseEntity.ok(analysis);
    }
}
