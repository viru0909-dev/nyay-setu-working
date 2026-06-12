package com.nyaysetu.backend.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.annotation.PostConstruct;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class DigitalSignatureService {

    private final Cache<String, SignatureMetadata> signatureRegistry = Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterWrite(24, TimeUnit.HOURS)
            .build();

    private PrivateKey privateKey;
    private PublicKey publicKey;

    @PostConstruct
    public void initKeys() {
        try {
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
            keyGen.initialize(2048);
            KeyPair pair = keyGen.generateKeyPair();
            this.privateKey = pair.getPrivate();
            this.publicKey = pair.getPublic();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to initialize RSA key pair for Digital Signatures", e);
        }
    }

    @Builder
    @Getter
    public static class SignatureMetadata {
        private final String documentId;
        private final String signerName;
        private final String signatureHash;
        private final LocalDateTime timestamp;
        private final boolean isValid;
    }

    public SignatureMetadata signDocument(String documentId) {
        if (documentId == null) {
            throw new IllegalArgumentException("Document ID cannot be null");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String signerName = (authentication != null && authentication.getName() != null) ? authentication.getName() : "Anonymous";

        String signatureHex = generateRsaSignature(documentId);

        SignatureMetadata metadata = SignatureMetadata.builder()
                .documentId(documentId)
                .signerName(signerName)
                .signatureHash(signatureHex)
                .timestamp(LocalDateTime.now())
                .isValid(true)
                .build();

        signatureRegistry.put(signatureHex, metadata);
        return metadata;
    }

    public boolean verifySignature(String signatureHash) {
        if (signatureHash == null) {
            return false;
        }
        SignatureMetadata metadata = signatureRegistry.getIfPresent(signatureHash);
        if (metadata == null || !metadata.isValid()) {
            return false;
        }
        return verifyRsaSignature(metadata.getDocumentId(), signatureHash);
    }

    private String generateRsaSignature(String input) {
        try {
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initSign(privateKey);
            signature.update(input.getBytes(StandardCharsets.UTF_8));
            byte[] signatureBytes = signature.sign();
            return bytesToHex(signatureBytes);
        } catch (Exception e) {
            log.error("Error generating RSA signature", e);
            throw new RuntimeException("Failed to generate digital signature", e);
        }
    }

    private boolean verifyRsaSignature(String input, String signatureHex) {
        try {
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initVerify(publicKey);
            signature.update(input.getBytes(StandardCharsets.UTF_8));
            byte[] signatureBytes = hexToBytes(signatureHex);
            return signature.verify(signatureBytes);
        } catch (Exception e) {
            log.error("Error verifying RSA signature", e);
            return false;
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    private byte[] hexToBytes(String hexString) {
        int len = hexString.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hexString.charAt(i), 16) << 4)
                                 + Character.digit(hexString.charAt(i+1), 16));
        }
        return data;
    }
}
