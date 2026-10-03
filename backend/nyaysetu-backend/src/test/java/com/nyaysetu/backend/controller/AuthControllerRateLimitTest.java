package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.LoginRequest;
import com.nyaysetu.backend.repository.PasswordResetTokenRepository;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.EmailService;
import com.nyaysetu.backend.service.FaceRecognitionService;
import com.nyaysetu.backend.service.JwtService;
import com.nyaysetu.backend.service.RedisRateLimitService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerRateLimitTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private AuthService authService;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private EmailService emailService;

    @Mock
    private FaceRecognitionService faceRecognitionService;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RedisRateLimitService redisRateLimitService;

    @InjectMocks
    private AuthController authController;

    @Test
    void loginReturnsTooManyRequestsBeforeAuthentication() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("user@example.com");
        loginRequest.setPassword("Secret123!");

        MockHttpServletRequest request =
                new MockHttpServletRequest();

        request.setRemoteAddr("203.0.113.10");

        when(redisRateLimitService.consumeLoginAttempt(
                "203.0.113.10",
                "user@example.com"
        )).thenReturn(
                RedisRateLimitService.RateLimitResult.blocked(
                        5,
                        42
                )
        );

        ResponseEntity<?> response =
                authController.login(loginRequest, request);

        assertEquals(
                HttpStatus.TOO_MANY_REQUESTS,
                response.getStatusCode()
        );

        assertEquals(
                "42",
                response.getHeaders().getFirst(
                        HttpHeaders.RETRY_AFTER
                )
        );

        assertEquals(
                "5",
                response.getHeaders().getFirst(
                        "X-RateLimit-Limit"
                )
        );

        assertEquals(
                "0",
                response.getHeaders().getFirst(
                        "X-RateLimit-Remaining"
                )
        );

        assertInstanceOf(Map.class, response.getBody());

        Map<?, ?> body = (Map<?, ?>) response.getBody();

        assertEquals(
                "Too many login attempts. Please try again later.",
                body.get("message")
        );

        assertEquals(
                42L,
                body.get("retryAfter")
        );

        verifyNoInteractions(authenticationManager);
        verifyNoInteractions(userRepository);
    }

    @Test
    void loginUsesFirstForwardedClientIp() {
        ReflectionTestUtils.setField(
                authController,
                "trustForwardedHeaders",
                true
        );
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("user@example.com");
        loginRequest.setPassword("Secret123!");

        MockHttpServletRequest request =
                new MockHttpServletRequest();

        request.setRemoteAddr("10.0.0.10");

        request.addHeader(
                "X-Forwarded-For",
                "198.51.100.20, 10.0.0.10"
        );

        when(redisRateLimitService.consumeLoginAttempt(
                "198.51.100.20",
                "user@example.com"
        )).thenReturn(
                RedisRateLimitService.RateLimitResult.blocked(
                        5,
                        30
                )
        );

        ResponseEntity<?> response =
                authController.login(loginRequest, request);

        assertEquals(
                HttpStatus.TOO_MANY_REQUESTS,
                response.getStatusCode()
        );

        verify(redisRateLimitService).consumeLoginAttempt(
                "198.51.100.20",
                "user@example.com"
        );

        verifyNoInteractions(authenticationManager);
    }
}