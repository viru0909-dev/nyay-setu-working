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
    
    // Security Claims Constant Tokens
    private static final String CLAIM_TOKEN_TYPE = "token_type";
    private static final String TYPE_ACCESS = "ACCESS";
    private static final String TYPE_REFRESH = "REFRESH";

    private final JwtSigningKeyService jwtSigningKeyService;
    private final ObjectMapper objectMapper;

    public JwtService(JwtSigningKeyService jwtSigningKeyService, ObjectMapper objectMapper) {
        this.jwtSigningKeyService = jwtSigningKeyService;
        this.objectMapper = objectMapper;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get(CLAIM_TOKEN_TYPE, String.class));
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
                .claim(CLAIM_TOKEN_TYPE, TYPE_ACCESS) // Security Fix: Explicit ACCESS context scope signature flag
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
                .claim(CLAIM_TOKEN_TYPE, TYPE_REFRESH) // Security Fix: Explicit REFRESH context scope signature flag
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRY))
                .signWith(jwtSigningKeyService.getCurrentSigningKey())
                .compact();
    }

    @Deprecated
    public boolean isTokenValid(String token, UserDetails userDetails) {
        return isAccessTokenValid(token, userDetails);
    }

    // Security Fix: Specialized validation gate isolating Short-Lived Access payloads
    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        String tokenType = extractTokenType(token);
        return username.equals(userDetails.getUsername()) 
                && TYPE_ACCESS.equalsIgnoreCase(tokenType) 
                && !isTokenExpired(token);
    }

    // Security Fix: Specialized validation gate isolating Long-Lived Refresh payloads
    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        String tokenType = extractTokenType(token);
        return username.equals(userDetails.getUsername()) 
                && TYPE_REFRESH.equalsIgnoreCase(tokenType) 
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}


