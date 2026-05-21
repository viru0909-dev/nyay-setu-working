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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.UserDetailsService;

import jakarta.mail.MessagingException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Authentication", description = "Register, login, password reset and face login")
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
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            // SECURITY FIX (P0 — Finding 23): Role self-assignment prevented.
            // The role field from the request body is INTENTIONALLY IGNORED.
            // All self-registered users are always LITIGANT.
            // Privileged roles (JUDGE, POLICE, ADMIN) must be granted by an administrator.
            authService.register(req.getEmail(), req.getName(), req.getPassword(), Role.LITIGANT);

            UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
            String token = jwtService.generateToken(new HashMap<>(), userDetails);
            var user = authService.findByEmail(req.getEmail());

            return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of("id", user.getId(), "email", user.getEmail(),
                               "name", user.getName(), "role", user.getRole().name())
            ));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists. Please login instead."));
        } catch (Exception e) {
            log.error("Registration error", e);
            // SECURITY: Do not leak internal exception details to the caller
            return ResponseEntity.badRequest().body(Map.of("message", "Registration failed. Please check your details."));
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() { return ResponseEntity.ok("pong"); }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
            UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
            String token = jwtService.generateToken(new HashMap<>(), userDetails);
            var user = authService.findByEmail(req.getEmail());
            return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of("id", user.getId(), "name", user.getName(),
                               "email", user.getEmail(), "role", user.getRole().name())
            ));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
    }

    // ==================== PASSWORD RESET ====================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        // SECURITY FIX (P2 — user enumeration): Always return the same response body
        // regardless of whether the email is registered. Different status codes or
        // messages leaked which emails had accounts.
        try {
            emailService.sendPasswordResetEmail(req.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send password reset email", e);
        } catch (Exception e) {
            log.warn("Forgot-password for unknown/error email (suppressed to prevent enumeration)");
        }
        return ResponseEntity.ok(Map.of("message",
            "If an account with that email exists, a password reset link has been sent."));
    }

    @GetMapping("/verify-reset-token")
    public ResponseEntity<?> verifyResetToken(@RequestParam String token) {
        try {
            PasswordResetToken t = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid"));
            if (t.isUsed()) return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Token already used"));
            if (t.getExpiryDate().isBefore(LocalDateTime.now())) return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Token expired"));
            return ResponseEntity.ok(Map.of("valid", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Invalid or expired token"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        try {
            PasswordResetToken t = tokenRepository.findByToken(req.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid token"));
            if (t.isUsed()) return ResponseEntity.badRequest().body(Map.of("message", "Token already used"));
            if (t.getExpiryDate().isBefore(LocalDateTime.now())) return ResponseEntity.badRequest().body(Map.of("message", "Token expired"));
            User user = t.getUser();
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
            authService.updateUser(user);
            t.setUsed(true);
            tokenRepository.save(t);
            log.info("Password reset successful for user: {}", user.getEmail());
            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        } catch (Exception e) {
            log.error("Error resetting password", e);
            return ResponseEntity.badRequest().body(Map.of("message", "Password reset failed. The link may be invalid or expired."));
        }
    }

    // ==================== FACE AUTH ====================

    /** Face login is public — it IS the authentication mechanism. */
    @PostMapping("/face/login")
    public ResponseEntity<?> loginWithFace(@RequestBody FaceLoginRequest req) {
        try {
            User user = faceRecognitionService.verifyFace(req.getEmail(), req.getFaceDescriptor());
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtService.generateToken(new HashMap<>(), userDetails);
            return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of("id", user.getId(), "name", user.getName(),
                               "email", user.getEmail(), "role", user.getRole().name())
            ));
        } catch (Exception e) {
            log.error("Face login failed", e);
            return ResponseEntity.status(401).body(Map.of("message", "Face verification failed"));
        }
    }

    /**
     * SECURITY FIX (P0 — Finding 2): Face enroll now requires authentication.
     * userId is derived from the JWT principal — callers cannot enroll a face
     * for a different user's account by passing an arbitrary userId in the body.
     */
    @PostMapping("/face/enroll")
    public ResponseEntity<?> enrollFace(@RequestBody FaceEnrollRequest req, Authentication authentication) {
        try {
            User me = authService.findByEmail(authentication.getName());
            faceRecognitionService.enrollFace(me.getId(), req.getFaceDescriptor());
            return ResponseEntity.ok(Map.of("message", "Face enrolled successfully"));
        } catch (Exception e) {
            log.error("Error enrolling face", e);
            return ResponseEntity.badRequest().body(Map.of("message", "Face enrollment failed"));
        }
    }

    /**
     * SECURITY FIX (P0 — Finding 2): disableFaceLogin now derives userId from JWT.
     * Previously accepted userId as a query param — any user could disable any other user's face login.
     */
    @DeleteMapping("/face/disable")
    public ResponseEntity<?> disableFaceLogin(Authentication authentication) {
        try {
            User me = authService.findByEmail(authentication.getName());
            faceRecognitionService.disableFaceLogin(me.getId());
            return ResponseEntity.ok(Map.of("message", "Face login disabled"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to disable face login"));
        }
    }

    /**
     * SECURITY FIX (P0 — Finding 2): getFaceLoginStatus derives userId from JWT.
     * Previously accepted userId as a query param — exposed enrollment state of arbitrary users.
     */
    @GetMapping("/face/status")
    public ResponseEntity<?> getFaceLoginStatus(Authentication authentication) {
        try {
            User me = authService.findByEmail(authentication.getName());
            boolean enrolled = faceRecognitionService.hasFaceEnrolled(me.getId());
            return ResponseEntity.ok(Map.of("enrolled", enrolled));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to check face login status"));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() { return ResponseEntity.ok("ok"); }
}
