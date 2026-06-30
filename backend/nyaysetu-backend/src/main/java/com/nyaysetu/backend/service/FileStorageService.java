package com.nyaysetu.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private static final String ALGORITHM = "AES";
    private static final byte[] KEY = "NyaySetuSecureMediaKey2026AES256".getBytes();

    public FileStorageService(@Value("${file.upload-dir:backend/uploads/documents}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory!", ex);
        }
    }

    private byte[] encrypt(byte[] data) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(KEY, ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            return cipher.doFinal(data);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    private byte[] decrypt(byte[] data) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(KEY, ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            return cipher.doFinal(data);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

    public String storeFile(MultipartFile file, String category) {
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + fileExtension;

        try {
            // Create category directory if it doesn't exist
            Path categoryPath = this.fileStorageLocation.resolve(category);
            Files.createDirectories(categoryPath);

            // Encrypt and write to target location
            Path targetLocation = categoryPath.resolve(fileName);
            byte[] fileBytes = file.getBytes();
            byte[] encryptedBytes = encrypt(fileBytes);
            Files.write(targetLocation, encryptedBytes);

            return category + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName, ex);
        }
    }

    public Resource loadFileAsResource(String filePath) {
        try {
            Path file = this.fileStorageLocation.resolve(filePath).normalize();
            if (Files.exists(file)) {
                byte[] encryptedBytes = Files.readAllBytes(file);
                byte[] decryptedBytes = decrypt(encryptedBytes);
                return new ByteArrayResource(decryptedBytes) {
                    @Override
                    public String getFilename() {
                        return file.getFileName().toString();
                    }
                };
            } else {
                throw new RuntimeException("File not found: " + filePath);
            }
        } catch (Exception ex) {
            throw new RuntimeException("File not found or decryption failed: " + filePath, ex);
        }
    }

    public void deleteFile(String filePath) {
        try {
            Path file = this.fileStorageLocation.resolve(filePath).normalize();
            Files.deleteIfExists(file);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file: " + filePath, ex);
        }
    }

    /**
     * Get file as java.io.File for processing (e.g., PDF analysis)
     */
    public java.io.File getFile(String filePath) {
        Path file = this.fileStorageLocation.resolve(filePath).normalize();
        if (!Files.exists(file)) {
            throw new RuntimeException("File not found: " + filePath);
        }
        try {
            byte[] encryptedBytes = Files.readAllBytes(file);
            byte[] decryptedBytes = decrypt(encryptedBytes);
            Path tempFile = Files.createTempFile("decrypted-", "-" + file.getFileName().toString());
            Files.write(tempFile, decryptedBytes);
            tempFile.toFile().deleteOnExit();
            return tempFile.toFile();
        } catch (IOException e) {
            throw new RuntimeException("Failed to decrypt file for processing", e);
        }
    }
}
