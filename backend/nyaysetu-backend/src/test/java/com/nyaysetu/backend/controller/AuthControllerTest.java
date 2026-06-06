package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.PasswordResetTokenRepository;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.EmailService;
import com.nyaysetu.backend.service.FaceRecognitionService;
import com.nyaysetu.backend.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private EmailService emailService;

    @MockBean
    private FaceRecognitionService faceRecognitionService;

    @MockBean
    private PasswordResetTokenRepository tokenRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Test
    void login_shouldReturnTokensAndUserProfileForValidCredentials() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("litigant@example.com")
                .password("encoded-password")
                .roles("LITIGANT")
                .build();
        User user = User.builder()
                .id(1L)
                .email("litigant@example.com")
                .name("Test Litigant")
                .role(Role.LITIGANT)
                .password("encoded-password")
                .build();

        when(userDetailsService.loadUserByUsername("litigant@example.com")).thenReturn(userDetails);
        when(jwtService.generateToken(anyMap(), eq(userDetails))).thenReturn("access.jwt.token");
        when(jwtService.generateRefreshToken(userDetails)).thenReturn("refresh.jwt.token");
        when(authService.findByEmail("litigant@example.com")).thenReturn(user);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "litigant@example.com",
                                  "password": "Strong@123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("access.jwt.token"))
                .andExpect(jsonPath("$.accessToken").value("access.jwt.token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh.jwt.token"))
                .andExpect(jsonPath("$.user.email").value("litigant@example.com"))
                .andExpect(jsonPath("$.user.role").value("LITIGANT"));
    }

    @Test
    void login_shouldReturnUnauthorizedForBadCredentials() throws Exception {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "litigant@example.com",
                                  "password": "wrong-password"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    void register_shouldRejectWeakPasswordBeforeCallingServiceLayer() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "new@example.com",
                                  "name": "New User",
                                  "password": "weakpass"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password must be at least 8 characters and include an uppercase letter, a number, and a special character (@#$!%*?&)."));

        verify(authService, never()).register(any(), any(), any(), any());
    }

    @Test
    void register_shouldDefaultMissingRoleToLitigantAndReturnToken() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("new@example.com")
                .password("encoded-password")
                .roles("LITIGANT")
                .build();
        User user = User.builder()
                .id(2L)
                .email("new@example.com")
                .name("New User")
                .role(Role.LITIGANT)
                .password("encoded-password")
                .build();

        when(userDetailsService.loadUserByUsername("new@example.com")).thenReturn(userDetails);
        when(jwtService.generateToken(anyMap(), eq(userDetails))).thenReturn("registered.access.token");
        when(authService.findByEmail("new@example.com")).thenReturn(user);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "new@example.com",
                                  "name": "New User",
                                  "password": "Strong@123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("registered.access.token"))
                .andExpect(jsonPath("$.user.email").value("new@example.com"))
                .andExpect(jsonPath("$.user.role").value("LITIGANT"));

        verify(authService).register("new@example.com", "New User", "Strong@123", Role.LITIGANT);
    }

    @Test
    void refreshToken_shouldReturnNewAccessTokenForValidRefreshToken() throws Exception {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("litigant@example.com")
                .password("encoded-password")
                .roles("LITIGANT")
                .build();

        when(jwtService.extractUsername("valid.refresh.token")).thenReturn("litigant@example.com");
        when(userDetailsService.loadUserByUsername("litigant@example.com")).thenReturn(userDetails);
        when(jwtService.isTokenValid("valid.refresh.token", userDetails)).thenReturn(true);
        when(jwtService.generateToken(anyMap(), eq(userDetails))).thenReturn("new.access.token");

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "valid.refresh.token"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new.access.token"))
                .andExpect(jsonPath("$.message").value("Token refreshed successfully"));
    }

    @Test
    void refreshToken_shouldReturnUnauthorizedForInvalidRefreshToken() throws Exception {
        when(jwtService.extractUsername("invalid.refresh.token")).thenReturn(null);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "invalid.refresh.token"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid refresh token"));
    }
}
