package com.nyaysetu.authservice.service;

import com.nyaysetu.authservice.dto.ProfileRequest;
import com.nyaysetu.authservice.entity.UserProfile;
import com.nyaysetu.authservice.repository.UserProfileRepository;
import com.nyaysetu.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserProfileRepository profileRepository;
    private final UserRepository userRepository;

    public UserProfile createOrUpdate(ProfileRequest request) {
        // ensure user exists
        if (!userRepository.existsById(request.getUserId())) {
            throw new IllegalArgumentException("User not found");
        }

        UserProfile profile = profileRepository.findByUserId(request.getUserId())
                .orElseGet(() -> UserProfile.builder().userId(request.getUserId()).build());

        profile.setAddress(request.getAddress());
        profile.setPhone(request.getPhone());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setCountry(request.getCountry());

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
}