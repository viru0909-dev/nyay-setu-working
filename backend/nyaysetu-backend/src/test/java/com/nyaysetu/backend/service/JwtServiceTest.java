package com.nyaysetu.backend.service;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String secret = "0123456789ABCDEF0123456789ABCDEF"; // 32 chars -> 256 bits

    @BeforeEach
    void setup() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", secret);
    }

    @Test
    void generateToken_shouldBeSignedAndValid() {
        UserDetails user = User.withUsername("alice@example.com").password("pw").roles("USER").build();
        String token = jwtService.generateToken(Map.of(), user);

        assertNotNull(token);
        assertEquals("alice@example.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void expiredToken_shouldThrowExpiredException_whenParsing() {
        // create an already-expired token
        Key key = Keys.hmacShaKeyFor(secret.getBytes());
        String expired = Jwts.builder()
                .setSubject("bob@example.com")
                .setIssuedAt(new Date(System.currentTimeMillis() - 10000))
                .setExpiration(new Date(System.currentTimeMillis() - 1000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        assertThrows(ExpiredJwtException.class, () -> jwtService.extractUsername(expired));
    }

    @Test
    void malformedToken_shouldBeRejected() {
        String bad = "this.is.not.a.valid.jwt";
        assertThrows(Exception.class, () -> jwtService.extractUsername(bad));
    }
}
