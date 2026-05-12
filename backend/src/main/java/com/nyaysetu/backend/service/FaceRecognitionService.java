package com.nyaysetu.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nyaysetu.backend.entity.FaceData;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.FaceDataRepository;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FaceRecognitionService {

    private final FaceDataRepository faceDataRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private static final double SIMILARITY_THRESHOLD = 0.6; // Adjust based on accuracy needs

    @Transactional
    public void enrollFace(Long userId, String faceDescriptorJson) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if face data already exists
        FaceData existingFaceData = faceDataRepository.findByUser(user).orElse(null);

        if (existingFaceData != null) {
            // Update existing
            existingFaceData.setFaceDescriptor(faceDescriptorJson);
            existingFaceData.setEnrolledAt(LocalDateTime.now());
            existingFaceData.setEnabled(true);
            faceDataRepository.save(existingFaceData);
            log.info("Updated face data for user: {}", user.getEmail());
        } else {
            // Create new
            FaceData faceData = FaceData.builder()
                    .user(user)
                    .faceDescriptor(faceDescriptorJson)
                    .enrolledAt(LocalDateTime.now())
                    .enabled(true)
                    .build();
            faceDataRepository.save(faceData);
            log.info("Enrolled face data for user: {}", user.getEmail());
        }
    }

    public User verifyFace(String email, String faceDescriptorJson) throws JsonProcessingException {
        // Find user and their enrolled face data
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FaceData enrolledFaceData = faceDataRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("No face data enrolled for this user"));

        if (!enrolledFaceData.isEnabled()) {
            throw new RuntimeException("Face login is disabled for this user");
        }

        // Parse face descriptors
        List<Double> providedDescriptor = objectMapper.readValue(
                faceDescriptorJson, 
                new TypeReference<List<Double>>() {}
        );
        List<Double> enrolledDescriptor = objectMapper.readValue(
                enrolledFaceData.getFaceDescriptor(), 
                new TypeReference<List<Double>>() {}
        );

        // Calculate Euclidean distance
        double distance = calculateEuclideanDistance(providedDescriptor, enrolledDescriptor);
        log.info("Face verification distance for {}: {}", email, distance);

        if (distance > SIMILARITY_THRESHOLD) {
            throw new RuntimeException("Face verification failed - faces do not match");
        }

        // Update last used timestamp
        enrolledFaceData.setLastUsed(LocalDateTime.now());
        faceDataRepository.save(enrolledFaceData);

        log.info("Face verification successful for user: {}", email);
        return user;
    }

    @Transactional
    public void disableFaceLogin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FaceData faceData = faceDataRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("No face data found"));

        faceData.setEnabled(false);
        faceDataRepository.save(faceData);
        log.info("Disabled face login for user: {}", user.getEmail());
    }

    @Transactional
    public void deleteFaceData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        faceDataRepository.deleteByUser(user);
        log.info("Deleted face data for user: {}", user.getEmail());
    }

    public boolean hasFaceEnrolled(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return faceDataRepository.existsByUser(user);
    }

    /**
     * Calculate Euclidean distance between two face descriptors
     * Lower distance = more similar faces
     */
    private double calculateEuclideanDistance(List<Double> desc1, List<Double> desc2) {
        if (desc1.size() != desc2.size()) {
            throw new IllegalArgumentException("Face descriptors must have the same dimensions");
        }

        double sum = 0.0;
        for (int i = 0; i < desc1.size(); i++) {
            double diff = desc1.get(i) - desc2.get(i);
            sum += diff * diff;
        }

        return Math.sqrt(sum);
    }
}
