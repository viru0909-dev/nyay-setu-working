package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.ProfileRequest;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.entity.UserProfile;
import com.nyaysetu.backend.repository.UserProfileRepository;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserProfileRepository profileRepository;
    private final UserRepository userRepository;

    private String normalizeThemePreference(String themePreference) {
        if (themePreference == null) {
            return "system";
        }

        String normalized = themePreference.trim().toLowerCase();
        return switch (normalized) {
            case "light", "dark", "system" -> normalized;
            default -> "system";
        };
    }

    public UserProfile createOrUpdate(ProfileRequest request) {
        // ensure user exists
        if (!userRepository.existsById(request.getUserId())) {
            throw new IllegalArgumentException("User not found");
        }

        UserProfile profile = profileRepository.findByUserId(request.getUserId())
                .orElseGet(() -> UserProfile.builder().userId(request.getUserId()).build());

        if (request.getAddress() != null) {
            profile.setAddress(request.getAddress());
        }
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getCity() != null) {
            profile.setCity(request.getCity());
        }
        if (request.getState() != null) {
            profile.setState(request.getState());
        }
        if (request.getCountry() != null) {
            profile.setCountry(request.getCountry());
        }
        if (request.getThemePreference() != null) {
            profile.setThemePreference(normalizeThemePreference(request.getThemePreference()));
        } else if (profile.getThemePreference() == null) {
            profile.setThemePreference("system");
        }

        return profileRepository.save(profile);
    }

    public Optional<UserProfile> findByUserId(Long userId) {
        return profileRepository.findByUserId(userId);
    }

    public void saveProfilePicture(Long userId, byte[] picture) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> UserProfile.builder().userId(userId).build());
        profile.setProfilePicture(picture);
        profileRepository.save(profile);
    }

    public void deleteUserAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        profileRepository.deleteByUserId(user.getId());
        userRepository.delete(user);
    }
}
