package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.*;
import com.nyaysetu.backend.entity.PasswordResetToken;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.PasswordResetTokenRepository;
import com.nyaysetu.backend.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.UserDetailsService;

import jakarta.mail.MessagingException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;
    private final FaceRecognitionService faceRecognitionService;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            authService.register(
                    req.getEmail(),
                    req.getName(),
                    req.getPassword(),
                    req.getRole() != null ? req.getRole() : Role.CLIENT // default to CLIENT
            );
            
            // Auto-login after registration
            UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
            String token = jwtService.generateToken(new HashMap<>(), userDetails);
            var user = authService.findByEmail(req.getEmail());
            
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", Map.of(
                            "id", user.getId(),
                            "email", user.getEmail(),
                            "name", user.getName(),
                            "role", user.getRole().name()
                    )
            ));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already exists. Please use a different email or login."));
        } catch (Exception e) {
            log.error("Registration error", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        System.out.println("DEBUG: LOGIN ENDPOINT REACHED for email: " + req.getEmail());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
            String token = jwtService.generateToken(new HashMap<>(), userDetails);

            var user = authService.findByEmail(req.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
            ));

            return ResponseEntity.ok(response);
        }
        catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
    }

    // ==================== PASSWORD RESET ENDPOINTS ====================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        try {
            emailService.sendPasswordResetEmail(req.getEmail());
            return ResponseEntity.ok(Map.of(
                "message", "Password reset email sent successfully",
                "email", req.getEmail()
            ));
        } catch (MessagingException e) {
            log.error("Failed to send password reset email", e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send email"));
        } catch (Exception e) {
            log.error("Error in forgot password", e);
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/verify-reset-token")
    public ResponseEntity<?> verifyResetToken(@RequestParam String token) {
        try {
            PasswordResetToken resetToken = tokenRepository.findByToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid token"));

            if (resetToken.isUsed()) {
                return ResponseEntity.status(400).body(Map.of("valid", false, "message", "Token already used"));
            }

            if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                return ResponseEntity.status(400).body(Map.of("valid", false, "message", "Token expired"));
            }

            return ResponseEntity.ok(Map.of("valid", true));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("valid", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        try {
            PasswordResetToken resetToken = tokenRepository.findByToken(req.getToken())
                    .orElseThrow(() -> new RuntimeException("Invalid token"));

            if (resetToken.isUsed()) {
                return ResponseEntity.status(400).body(Map.of("message", "Token already used"));
            }

            if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                return ResponseEntity.status(400).body(Map.of("message", "Token expired"));
            }

            // Update password
            User user = resetToken.getUser();
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
            authService.updateUser(user);

            // Mark token as used
            resetToken.setUsed(true);
            tokenRepository.save(resetToken);

            log.info("Password reset successful for user: {}", user.getEmail());
            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        } catch (Exception e) {
            log.error("Error resetting password", e);
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    // ==================== FACE LOGIN ENDPOINTS ====================

    @PostMapping("/face/enroll")
    public ResponseEntity<?> enrollFace(@RequestBody FaceEnrollRequest req) {
        try {
            faceRecognitionService.enrollFace(req.getUserId(), req.getFaceDescriptor());
            return ResponseEntity.ok(Map.of("message", "Face enrolled successfully"));
        } catch (Exception e) {
            log.error("Error enrolling face", e);
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/face/login")
    public ResponseEntity<?> loginWithFace(@RequestBody FaceLoginRequest req) {
        try {
            User user = faceRecognitionService.verifyFace(req.getEmail(), req.getFaceDescriptor());

            // Generate JWT token
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtService.generateToken(new HashMap<>(), userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
            ));

            log.info("Face login successful for user: {}", user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Face login failed", e);
            return ResponseEntity.status(401).body(Map.of("message", "Face verification failed"));
        }
    }

    @DeleteMapping("/face/disable")
    public ResponseEntity<?> disableFaceLogin(@RequestParam Long userId) {
        try {
            faceRecognitionService.disableFaceLogin(userId);
            return ResponseEntity.ok(Map.of("message", "Face login disabled"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/face/status")
    public ResponseEntity<?> getFaceLoginStatus(@RequestParam Long userId) {
        try {
            boolean enrolled = faceRecognitionService.hasFaceEnrolled(userId);
            return ResponseEntity.ok(Map.of("enrolled", enrolled));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("ok");
    }
}