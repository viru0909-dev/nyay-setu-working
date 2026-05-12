package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.FaceEnrollRequest;
import com.nyaysetu.backend.dto.FaceLoginRequest;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.FaceRecognitionService;
import com.nyaysetu.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/face")
@RequiredArgsConstructor
@Slf4j
public class FaceRecognitionController {

    private final FaceRecognitionService faceRecognitionService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @PostMapping("/enroll")
    public ResponseEntity<?> enrollFace(@RequestBody FaceEnrollRequest request, Authentication auth) {
        try {
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
            }
            
            User user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            faceRecognitionService.enrollFace(user.getId(), request.getFaceDescriptor());
            return ResponseEntity.ok(Map.of("message", "Face enrolled successfully"));
        } catch (Exception e) {
            log.error("Face enrollment failed", e);
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyFace(@RequestBody FaceLoginRequest request) {
        try {
            User user = faceRecognitionService.verifyFace(request.getEmail(), request.getFaceDescriptor());
            
            // Generate token upon successful face verification
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtService.generateToken(new HashMap<>(), userDetails);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Face verification failed for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getFaceStatus(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean hasFace = faceRecognitionService.hasFaceEnrolled(user.getId());
        return ResponseEntity.ok(Map.of("hasFaceEnrolled", hasFace));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFace(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        faceRecognitionService.deleteFaceData(user.getId());
        return ResponseEntity.ok(Map.of("message", "Face data removed successfully"));
    }
}
