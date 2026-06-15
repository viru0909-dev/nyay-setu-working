package com.nyaysetu.backend.service;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private static final String TEST_SECRET_KEY = "0123456789ABCDEF0123456789ABCDEF"; // 32 chars -> 256 bits
    private static final String MALFORMED_TOKEN = "this.is.not.a.valid.jwt";
    private static final long ONE_MINUTE_IN_MILLIS = 60_000L;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET_KEY);
    }

    @Test
    void generateToken_shouldBeSignedAndValid() {
        UserDetails user = createUser("alice@example.com");
        String token = jwtService.generateToken(Map.of(), user);

        assertNotNull(token);
        assertEquals("alice@example.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void expiredToken_shouldThrowExpiredException_whenParsing() {

        // Create an already-expired token
        Key key = Keys.hmacShaKeyFor(TEST_SECRET_KEY.getBytes());
        String expiredToken = Jwts.builder()
                .setSubject("bob@example.com")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() - ONE_MINUTE_IN_MILLIS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        assertThrows(ExpiredJwtException.class, () -> jwtService.extractUsername(expiredToken));
    }

    @Test
    void malformedToken_shouldBeRejected() {
        assertThrows(MalformedJwtException.class, () -> jwtService.extractUsername(MALFORMED_TOKEN));
    }

    @Test
    void generateRefreshToken_shouldBeSignedAndValid() {
        UserDetails user = createUser("alice@example.com");
        String refreshToken = jwtService.generateRefreshToken(user);

        assertNotNull(refreshToken);
        assertEquals("alice@example.com", jwtService.extractUsername(refreshToken));
        assertTrue(jwtService.isTokenValid(refreshToken, user));
    }

    @Test
    void isTokenValid_withDifferentUser_shouldReturnFalse() {
        UserDetails user1 = createUser("alice@example.com");
        UserDetails user2 = createUser("alex@example.com");
        String token = jwtService.generateToken(Map.of(), user1);

        assertFalse(jwtService.isTokenValid(token, user2));
    }

    @Test
    void generateToken_withExtraClaims_shouldPreserveThem() {
        UserDetails user = createUser("alice@example.com");
        String token = jwtService.generateToken(Map.of("role", "LITIGANT"), user);
        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));

        assertEquals("LITIGANT", role);
    }

    @Test
    void tokenSignedWithDifferentKey_shouldBeRejected() {

        // Token is signed with a different key and should fail signature validation
        Key differentKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        String foreignToken = Jwts.builder()
                .setSubject("different@example.com")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ONE_MINUTE_IN_MILLIS))
                .signWith(differentKey, SignatureAlgorithm.HS256)
                .compact();

        assertThrows(SignatureException.class, () -> jwtService.extractUsername(foreignToken));
    }

    private UserDetails createUser(String username) {
        return User.withUsername(username)
                .password("pw")
                .roles("USER")
                .build();
    }
}
