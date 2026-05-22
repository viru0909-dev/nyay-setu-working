package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.LawyerProfileDTO;
import com.nyaysetu.backend.entity.LawyerProfile;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.LawyerProfileRepository;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class LawyerProfileService {
    private final LawyerProfileRepository lawyerProfileRepository;
    private final UserRepository userRepository;

    public LawyerProfile createLawyerProfile(Long userId, String bio, Integer yearsOfExperience,
                                            Double hourlyRate, List<String> specializations) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LawyerProfile profile = LawyerProfile.builder()
                .user(user)
                .bio(bio)
                .yearsOfExperience(yearsOfExperience)
                .hourlyRate(hourlyRate)
                .specializations(specializations)
                .averageRating(0.0)
                .totalRatings(0)
                .verified(false)
                .active(true)
                .build();

        return lawyerProfileRepository.save(profile);
    }

    public Page<LawyerProfileDTO> getAllLawyers(Pageable pageable) {
        return lawyerProfileRepository.findByVerifiedTrueAndActiveTrue(pageable)
                .map(this::toDTO);
    }

    public Page<LawyerProfileDTO> searchLawyers(String searchText, Double minRating, Pageable pageable) {
        if (searchText != null && !searchText.isBlank() && minRating != null) {
            return lawyerProfileRepository.searchByNameRatingAndVerified(searchText, minRating, pageable)
                    .map(this::toDTO);
        } else if (searchText != null && !searchText.isBlank()) {
            return lawyerProfileRepository.searchByNameAndVerified(searchText, pageable)
                    .map(this::toDTO);
        } else if (minRating != null) {
            return lawyerProfileRepository.findByMinRating(minRating, pageable)
                    .map(this::toDTO);
        }
        return getAllLawyers(pageable);
    }

    public LawyerProfileDTO getLawyerById(Long lawyerId) {
        LawyerProfile lawyer = lawyerProfileRepository.findById(lawyerId)
                .orElseThrow(() -> new IllegalArgumentException("Lawyer not found"));
        return toDTO(lawyer);
    }

    public Optional<LawyerProfileDTO> getLawyerByUserId(Long userId) {
        return lawyerProfileRepository.findByUserId(userId)
                .map(this::toDTO);
    }

    public void updateLawyerRating(Long lawyerId, Double newRating) {
        LawyerProfile lawyer = lawyerProfileRepository.findById(lawyerId)
                .orElseThrow(() -> new IllegalArgumentException("Lawyer not found"));

        int totalRatings = lawyer.getTotalRatings();
        double currentAverage = lawyer.getAverageRating();

        double updatedAverage = (currentAverage * totalRatings + newRating) / (totalRatings + 1);
        lawyer.setAverageRating(updatedAverage);
        lawyer.setTotalRatings(totalRatings + 1);

        lawyerProfileRepository.save(lawyer);
    }

    public void verifyLawyer(Long lawyerId) {
        LawyerProfile lawyer = lawyerProfileRepository.findById(lawyerId)
                .orElseThrow(() -> new IllegalArgumentException("Lawyer not found"));
        lawyer.setVerified(true);
        lawyerProfileRepository.save(lawyer);
    }

    private LawyerProfileDTO toDTO(LawyerProfile lawyer) {
        return LawyerProfileDTO.builder()
                .id(lawyer.getId())
                .userId(lawyer.getUser().getId())
                .name(lawyer.getUser().getName())
                .email(lawyer.getUser().getEmail())
                .bio(lawyer.getBio())
                .yearsOfExperience(lawyer.getYearsOfExperience())
                .hourlyRate(lawyer.getHourlyRate())
                .specializations(lawyer.getSpecializations())
                .averageRating(lawyer.getAverageRating())
                .totalRatings(lawyer.getTotalRatings())
                .verified(lawyer.getVerified())
                .active(lawyer.getActive())
                .profileImageUrl(lawyer.getProfileImageUrl())
                .build();
    }
}
