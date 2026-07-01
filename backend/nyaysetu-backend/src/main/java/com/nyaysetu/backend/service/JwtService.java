package com.nyaysetu.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final long ACCESS_TOKEN_EXPIRY = 1000 * 60 * 15;
    private static final long REFRESH_TOKEN_EXPIRY = 1000 * 60 * 60 * 24 * 7;

    private final JwtSigningKeyService jwtSigningKeyService;
    private final ObjectMapper objectMapper;

    public JwtService(JwtSigningKeyService jwtSigningKeyService, ObjectMapper objectMapper) {
        this.jwtSigningKeyService = jwtSigningKeyService;
        this.objectMapper = objectMapper;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        String keyId = extractKeyId(token);

        if (keyId != null && !keyId.isBlank()) {
            SecretKey verificationKey = jwtSigningKeyService.getVerificationKey(keyId)
                    .orElseThrow(() -> new JwtException("Unknown JWT signing key id: " + keyId));

            return parseClaims(token, verificationKey);
        }

        return parseLegacyTokenWithAvailableKeys(token);
    }

    private Claims parseLegacyTokenWithAvailableKeys(String token) {
        JwtException lastException = null;

        for (SecretKey key : jwtSigningKeyService.getVerificationKeys().values()) {
            try {
                return parseClaims(token, key);
            } catch (JwtException exception) {
                lastException = exception;
            }
        }

        if (lastException != null) {
            throw lastException;
        }

        throw new JwtException("No JWT verification keys configured");
    }

    private Claims parseClaims(String token, SecretKey key) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private String extractKeyId(String token) {
        try {
            String[] parts = token.split("\\.");

            if (parts.length < 2) {
                return null;
            }

            String headerJson = new String(
                    Base64.getUrlDecoder().decode(parts[0]),
                    StandardCharsets.UTF_8
            );

            JsonNode keyIdNode = objectMapper.readTree(headerJson).get("kid");
            return keyIdNode == null ? null : keyIdNode.asText(null);
        } catch (Exception ignored) {
            return null;
        }
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .header()
                .keyId(jwtSigningKeyService.getCurrentKeyId())
                .and()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRY))
                .signWith(jwtSigningKeyService.getCurrentSigningKey())
                .compact();
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return Jwts.builder()
                .header()
                .keyId(jwtSigningKeyService.getCurrentKeyId())
                .and()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRY))
                .signWith(jwtSigningKeyService.getCurrentSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
