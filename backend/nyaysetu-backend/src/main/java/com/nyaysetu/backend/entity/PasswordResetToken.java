package com.nyaysetu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Hardened field: Stores exclusively the one-way cryptographic SHA-256 hash representation of the raw token string
    @Column(nullable = false, unique = true)
    private String token;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    
    @Builder.Default
    @Column(nullable = false)
    private boolean used = false;
    
    @Column
    private LocalDateTime createdAt;

    /**
     * Computes a secure SHA-256 hex string hash from a raw plaintext token.
     * Prevents account takeovers by shielding the data store from credential leakages.
     *
     * @param rawToken The plain input token string sent to the user.
     * @return The secure 64-character hexadecimal SHA-256 hash string.
     */
    public static String hashToken(String rawToken) {
        if (rawToken == null) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Critical Security Exception: SHA-256 algorithm implementation missing.", e);
        }
    }
}
