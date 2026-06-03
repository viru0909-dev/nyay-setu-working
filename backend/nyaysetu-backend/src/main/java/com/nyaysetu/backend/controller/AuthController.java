package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.*;
import com.nyaysetu.backend.entity.PasswordResetToken;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.PasswordResetTokenRepository;
import com.nyaysetu.backend.service.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.UserDetailsService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.mail.MessagingException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.regex.Pattern;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;

@Tag(name = "Authentication", description = "Register, login, password reset and face login")
@RestController
@RequestMapping("/auth")
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

    @SecurityRequirements
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req, HttpServletResponse response) {
        try {
            Pattern pwPattern = Pattern.compile("^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$!%*?&]).{8,}$");
                if (!pwPattern.matcher(req.getPassword()).matches()) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("message", "Password must be at least 8 characters and include an uppercase letter, a number, and a special character (@#$!%*?&)."));
                }
            authService.register(
                    req.getEmail(),
                    req.getName(),
                    req.getPassword(),
                    req.getRole() != null ? req.getRole() : Role.LITIGANT // default to LITIGANT
            );
            
            // Auto-login after registration
            UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
            String token = jwtService.generateToken(new HashMap<>(), userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            var user = authService.findByEmail(req.getEmail());
            
            setAuthCookies(response, token, refreshToken);
            
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "accessToken", token,
                    "refreshToken", refreshToken,
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

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @SecurityRequirements
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpServletResponse response) {
        log.debug("Login endpoint reached for email: {}", req.getEmail());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
            String token = jwtService.generateToken(new HashMap<>(), userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            var user = authService.findByEmail(req.getEmail());

            setAuthCookies(response, token, refreshToken);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("accessToken", token);
            responseData.put("refreshToken", refreshToken);
            responseData.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
            ));

            return ResponseEntity.ok(responseData);
        }
        catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        clearAuthCookies(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @SecurityRequirements
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest req, HttpServletResponse response) {
        try {
            String refreshToken = req.getRefreshToken();
            String username = jwtService.extractUsername(refreshToken);

            if (username == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid refresh token"));
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtService.isTokenValid(refreshToken, userDetails)) {
                return ResponseEntity.status(401).body(Map.of("message", "Refresh token expired or invalid. Please login again."));
            }

            // Issue a new short-lived access token
            String newAccessToken = jwtService.generateToken(new HashMap<>(), userDetails);
            
            setAuthCookies(response, newAccessToken, null);

            return ResponseEntity.ok(Map.of(
                    "accessToken", newAccessToken,
                    "message", "Token refreshed successfully"
            ));

        } catch (Exception e) {
            log.error("Token refresh failed", e);
            return ResponseEntity.status(401).body(Map.of("message", "Token refresh failed. Please login again."));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        
        User user = authService.findByEmail(auth.getName());
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole().name()
        ));
    }

    private void setAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(15 * 60) // 15 minutes
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());

        if (refreshToken != null) {
            ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(false) // Set to true in production with HTTPS
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60) // 7 days
                    .sameSite("Strict")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
        }
    }

    private void clearAuthCookies(HttpServletResponse response) {
        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", null)
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", null)
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
    }

    // ==================== PASSWORD RESET ENDPOINTS ====================

    @SecurityRequirements
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
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
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
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
    public ResponseEntity<?> enrollFace(@Valid @RequestBody FaceEnrollRequest req, Authentication auth) {
        try {
            User user = authService.findByEmail(auth.getName());
            faceRecognitionService.enrollFace(user.getId(), req.getFaceDescriptor());
            return ResponseEntity.ok(Map.of("message", "Face enrolled successfully"));
        } catch (Exception e) {
            log.error("Error enrolling face", e);
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/face/login")
    public ResponseEntity<?> loginWithFace(@Valid @RequestBody FaceLoginRequest req, HttpServletResponse response) {
        try {
            User user = faceRecognitionService.verifyFace(req.getEmail(), req.getFaceDescriptor());

            // Generate JWT token
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtService.generateToken(new HashMap<>(), userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            setAuthCookies(response, token, refreshToken);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("accessToken", token);
            responseData.put("refreshToken", refreshToken);
            responseData.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
            ));

            log.info("Face login successful for user: {}", user.getEmail());
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            log.error("Face login failed", e);
            return ResponseEntity.status(401).body(Map.of("message", "Face verification failed"));
        }
    }

    @DeleteMapping("/face/disable")
    public ResponseEntity<?> disableFaceLogin(Authentication auth) {
        try {
            User user = authService.findByEmail(auth.getName());
            faceRecognitionService.disableFaceLogin(user.getId());
            return ResponseEntity.ok(Map.of("message", "Face login disabled"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/face/status")
    public ResponseEntity<?> getFaceLoginStatus(Authentication auth) {
        try {
            User user = authService.findByEmail(auth.getName());
            boolean enrolled = faceRecognitionService.hasFaceEnrolled(user.getId());
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