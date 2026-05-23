package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.AuthResponse;
import com.nyaysetu.backend.entity.RefreshToken;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${auth.refresh-token.expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    @Transactional
    public AuthResponse issueTokens(User user) {
        refreshTokenRepository.deleteByUser(user);
        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken existingToken = refreshTokenRepository.findByToken(rawRefreshToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (existingToken.isRevoked()) {
            throw new IllegalArgumentException("Refresh token has been revoked");
        }

        if (existingToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            existingToken.setRevoked(true);
            existingToken.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(existingToken);
            throw new IllegalArgumentException("Refresh token has expired");
        }

        User user = existingToken.getUser();
        existingToken.setRevoked(true);
        existingToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(existingToken);

        return createAuthResponse(user);
    }

    @Transactional
    public void revokeAllForUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }

    private AuthResponse createAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateToken(Map.of(), userDetails);
        String refreshToken = persistRefreshToken(user).getToken();

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .user(Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()
                ))
                .build();
    }

    private RefreshToken persistRefreshToken(User user) {
        return refreshTokenRepository.save(
                RefreshToken.builder()
                        .token(generateSecureToken())
                        .user(user)
                        .createdAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000))
                        .revoked(false)
                        .build()
        );
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
