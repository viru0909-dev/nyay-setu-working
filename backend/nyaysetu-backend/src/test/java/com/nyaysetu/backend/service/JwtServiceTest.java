package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String CURRENT_KEY_ID = "current-2026-06";
    private static final String PREVIOUS_KEY_ID = "previous-2026-05";
    private static final String UNKNOWN_KEY_ID = "unknown-2026-04";

    private static final String CURRENT_SECRET =
            "current-secret-key-for-jwt-rotation-tests-minimum-256-bits";
    private static final String PREVIOUS_SECRET =
            "previous-secret-key-for-jwt-rotation-tests-minimum-256-bits";
    private static final String UNKNOWN_SECRET =
            "unknown-secret-key-for-jwt-rotation-tests-minimum-256-bits";

    private JwtService jwtService;
    private UserDetails userDetails;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        JwtSigningKeyService signingKeyService = new JwtSigningKeyService();

        ReflectionTestUtils.setField(signingKeyService, "currentKeyId", CURRENT_KEY_ID);
        ReflectionTestUtils.setField(signingKeyService, "currentSecret", CURRENT_SECRET);
        ReflectionTestUtils.setField(
                signingKeyService,
                "previousKeys",
                PREVIOUS_KEY_ID + "=" + PREVIOUS_SECRET
        );

        signingKeyService.init();

        objectMapper = new ObjectMapper();
        jwtService = new JwtService(signingKeyService, objectMapper);

        userDetails = User.withUsername("test@example.com")
                .password("password")
                .authorities("USER")
                .build();
    }

    @Test
    void generatedTokenUsesCurrentKeyIdAndRemainsValid() throws Exception {
        String token = jwtService.generateToken(Map.of(), userDetails);

        assertEquals(CURRENT_KEY_ID, extractKid(token));
        assertTrue(jwtService.isTokenValid(token, userDetails));
        assertEquals("test@example.com", jwtService.extractUsername(token));
    }

    @Test
    void tokenSignedWithPreviousKeyRemainsValidDuringRotationGracePeriod() {
        String token = createToken(
                "test@example.com",
                PREVIOUS_KEY_ID,
                PREVIOUS_SECRET,
                System.currentTimeMillis() + 60_000,
                true
        );

        assertTrue(jwtService.isTokenValid(token, userDetails));
        assertEquals("test@example.com", jwtService.extractUsername(token));
    }

    @Test
    void legacyTokenWithoutKidIsAcceptedWhenSignedByConfiguredKey() {
        String token = createToken(
                "test@example.com",
                null,
                PREVIOUS_SECRET,
                System.currentTimeMillis() + 60_000,
                false
        );

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void tokenWithUnknownKeyIdIsRejected() {
        String token = createToken(
                "test@example.com",
                UNKNOWN_KEY_ID,
                UNKNOWN_SECRET,
                System.currentTimeMillis() + 60_000,
                true
        );

        assertThrows(JwtException.class, () -> jwtService.extractUsername(token));
    }

    @Test
    void expiredTokenIsRejectedEvenWhenKeyIsKnown() {
        String token = createToken(
                "test@example.com",
                CURRENT_KEY_ID,
                CURRENT_SECRET,
                System.currentTimeMillis() - 60_000,
                true
        );

        assertThrows(ExpiredJwtException.class, () -> jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void refreshTokenIsSignedWithCurrentKeyIdAndValid() throws Exception {
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        assertEquals(CURRENT_KEY_ID, extractKid(refreshToken));
        assertTrue(jwtService.isTokenValid(refreshToken, userDetails));
    }

    private String createToken(
            String subject,
            String keyId,
            String secret,
            long expirationTime,
            boolean includeKid
    ) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        var builder = Jwts.builder();

        if (includeKid) {
            builder.header()
                    .keyId(keyId)
                    .and();
        }

        return builder
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(expirationTime))
                .signWith(key)
                .compact();
    }

    private String extractKid(String token) throws Exception {
        String encodedHeader = token.split("\\.")[0];
        String headerJson = new String(
                Base64.getUrlDecoder().decode(encodedHeader),
                StandardCharsets.UTF_8
        );

        JsonNode keyIdNode = objectMapper.readTree(headerJson).get("kid");
        return keyIdNode.asText();
    }
}
