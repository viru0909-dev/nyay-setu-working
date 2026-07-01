package com.nyaysetu.backend.service;

import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class JwtSigningKeyService {

    @Value("${jwt.secret}")
    private String currentSecret;

    @Value("${jwt.current-key-id:current}")
    private String currentKeyId;

    /**
     * Comma-separated previous keys in this format:
     * old-key-id-1=old-secret-value,old-key-id-2=another-old-secret
     */
    @Value("${jwt.previous-keys:}")
    private String previousKeys;

    private SecretKey currentSigningKey;
    private Map<String, SecretKey> verificationKeys;

    @PostConstruct
    void init() {
        currentSigningKey = toSecretKey(currentSecret);

        Map<String, SecretKey> keys = new LinkedHashMap<>();
        keys.put(currentKeyId, currentSigningKey);

        if (previousKeys != null && !previousKeys.isBlank()) {
            for (String entry : previousKeys.split(",")) {
                String trimmedEntry = entry.trim();

                if (trimmedEntry.isBlank()) {
                    continue;
                }

                String[] parts = trimmedEntry.split("=", 2);

                if (parts.length != 2 || parts[0].isBlank() || parts[1].isBlank()) {
                    throw new IllegalArgumentException(
                            "Invalid jwt.previous-keys entry. Expected format: key-id=secret"
                    );
                }

                keys.put(parts[0].trim(), toSecretKey(parts[1].trim()));
            }
        }

        verificationKeys = Collections.unmodifiableMap(keys);
    }

    public String getCurrentKeyId() {
        return currentKeyId;
    }

    public SecretKey getCurrentSigningKey() {
        return currentSigningKey;
    }

    public Optional<SecretKey> getVerificationKey(String keyId) {
        return Optional.ofNullable(verificationKeys.get(keyId));
    }

    public Map<String, SecretKey> getVerificationKeys() {
        return verificationKeys;
    }

    private SecretKey toSecretKey(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException("JWT signing secret must not be blank");
        }

        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
