package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.ProfileRequest;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.entity.UserProfile;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.repository.UserProfileRepository;
import com.nyaysetu.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserProfileRepository profileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProfileService profileService;

    private User testUser;
    private UserProfile testProfile;
    private ProfileRequest profileRequest;

    @BeforeEach
    void setup() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .password("secret")
                .role(Role.LITIGANT)
                .build();

        testProfile = UserProfile.builder()
                .id(1L)
                .userId(1L)
                .address("123 Main St")
                .city("New York")
                .state("NY")
                .country("USA")
                .phone("1234567890")
                .themePreference("system")
                .build();

        profileRequest = new ProfileRequest();
        profileRequest.setUserId(1L);
    }

    @Test
    void createOrUpdate_shouldThrowExceptionIfUserNotFound() {
        profileRequest.setUserId(999L);
        when(userRepository.existsById(999L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> profileService.createOrUpdate(profileRequest));
        verify(userRepository).existsById(999L);
        verify(profileRepository, never()).save(any());
    }

    @Test
    void createOrUpdate_shouldCreateNewProfileIfNotExists() {
        profileRequest.setAddress("123 Main St");
        profileRequest.setCity("New York");
        profileRequest.setState("NY");
        profileRequest.setCountry("USA");
        profileRequest.setPhone("1234567890");

        when(userRepository.existsById(1L)).thenReturn(true);
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfile result = profileService.createOrUpdate(profileRequest);

        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertEquals("123 Main St", result.getAddress());
        assertEquals("New York", result.getCity());
        assertEquals("NY", result.getState());
        assertEquals("USA", result.getCountry());
        assertEquals("1234567890", result.getPhone());
        assertEquals("system", result.getThemePreference());
        verify(profileRepository).save(any(UserProfile.class));
    }

    @Test
    void createOrUpdate_shouldUpdateExistingProfile() {
        profileRequest.setAddress("456 Oak Ave");
        profileRequest.setCity("Boston");

        when(userRepository.existsById(1L)).thenReturn(true);
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(profileRepository.save(any(UserProfile.class))).thenReturn(testProfile);

        UserProfile result = profileService.createOrUpdate(profileRequest);

        assertNotNull(result);
        verify(profileRepository).save(any(UserProfile.class));
    }

    @Test
    void createOrUpdate_shouldNormalizeThemePreferenceToLight() {
        profileRequest.setThemePreference("light");

        when(userRepository.existsById(1L)).thenReturn(true);
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> {
            UserProfile profile = invocation.getArgument(0);
            assertEquals("light", profile.getThemePreference());
            return profile;
        });

        profileService.createOrUpdate(profileRequest);
        verify(profileRepository).save(any(UserProfile.class));
    }

    @Test
    void createOrUpdate_shouldNormalizeThemePreferenceToDark() {
        profileRequest.setThemePreference("dark");

        when(userRepository.existsById(1L)).thenReturn(true);
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> {
            UserProfile profile = invocation.getArgument(0);
            assertEquals("dark", profile.getThemePreference());
            return profile;
        });

        profileService.createOrUpdate(profileRequest);
        verify(profileRepository).save(any(UserProfile.class));
    }

    @Test
    void createOrUpdate_shouldNormalizeThemePreferenceToSystem() {
        profileRequest.setThemePreference("system");

        when(userRepository.existsById(1L)).thenReturn(true);
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> {
            UserProfile profile = invocation.getArgument(0);
            assertEquals("system", profile.getThemePreference());
            return profile;
        });

        profileService.createOrUpdate(profileRequest);
        verify(profileRepository).save(any(UserProfile.class));
    }

    @Test
    void createOrUpdate_shouldNormalizeInvalidThemePreferenceToSystem() {
        profileRequest.setThemePreference("invalid");

        when(userRepository.existsById(1L)).thenReturn(true);
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> {
            UserProfile profile = invocation.getArgument(0);
            assertEquals("system", profile.getThemePreference());
            return profile;
        });

        profileService.createOrUpdate(profileRequest);
        verify(profileRepository).save(any(UserProfile.class));
    }

    @Test
    void createOrUpdate_shouldHandleNullThemePreference() {
        profileRequest.setThemePreference(null);

        when(userRepository.existsById(1L)).thenReturn(true);
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(profileRepository.save(any(UserProfile.class))).thenReturn(testProfile);

        profileService.createOrUpdate(profileRequest);
        verify(profileRepository).save(any(UserProfile.class));
    }

    @Test
    void createOrUpdate_shouldSetDefaultThemePreferenceForNewProfile() {
        when(userRepository.existsById(1L)).thenReturn(true);
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> {
            UserProfile profile = invocation.getArgument(0);
            assertEquals("system", profile.getThemePreference());
            assertEquals(1L, profile.getUserId());
            return profile;
        });

        profileService.createOrUpdate(profileRequest);
        verify(profileRepository).save(any(UserProfile.class));
    }

    @Test
    void findByUserId_shouldReturnProfileIfExists() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));

        Optional<UserProfile> result = profileService.findByUserId(1L);

        assertTrue(result.isPresent());
        assertEquals(testProfile, result.get());
    }

    @Test
    void findByUserId_shouldReturnEmptyIfNotExists() {
        when(profileRepository.findByUserId(999L)).thenReturn(Optional.empty());

        Optional<UserProfile> result = profileService.findByUserId(999L);

        assertFalse(result.isPresent());
    }

    @Test
    void saveProfilePicture_shouldCreateProfileIfNotExists() {
        byte[] picture = "picture-data".getBytes();

        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(profileRepository.save(any(UserProfile.class))).thenReturn(testProfile);

        profileService.saveProfilePicture(1L, picture);

        verify(profileRepository).save(any(UserProfile.class));
    }

    @Test
    void saveProfilePicture_shouldUpdateExistingProfile() {
        byte[] picture = "picture-data".getBytes();

        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(profileRepository.save(any(UserProfile.class))).thenReturn(testProfile);

        profileService.saveProfilePicture(1L, picture);

        verify(profileRepository).save(any(UserProfile.class));
    }

    @Test
    void deleteUserAccount_shouldThrowExceptionIfUserNotFound() {
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> profileService.deleteUserAccount("notfound@example.com"));
        verify(userRepository, never()).delete(any());
    }

    @Test
    void deleteUserAccount_shouldDeleteUserIfExists() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        profileService.deleteUserAccount("test@example.com");

        verify(profileRepository).deleteByUserId(1L);
        verify(userRepository).delete(testUser);
    }
}
