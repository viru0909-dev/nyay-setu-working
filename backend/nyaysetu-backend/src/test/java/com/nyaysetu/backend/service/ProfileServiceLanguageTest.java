package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserProfileRepository;
import com.nyaysetu.backend.repository.UserRepository;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import com.nyaysetu.backend.dto.LanguagePreferenceRequest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Issue #1629: the interface language is stored on the account so a litigant who
 * signs in from a shared computer or a new phone keeps the language they chose.
 */
class ProfileServiceLanguageTest {

    private static final String EMAIL = "litigant@example.com";

    private UserRepository userRepository;
    private ProfileService profileService;
    private Validator validator;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        profileService = new ProfileService(mock(UserProfileRepository.class), userRepository);
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    private User existingUser(String preferredLanguage) {
        User user = User.builder().id(1L).email(EMAIL).preferredLanguage(preferredLanguage).build();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        return user;
    }

    @Test
    void storesTheChosenLanguageOnTheAccount() {
        User user = existingUser(null);

        String saved = profileService.updatePreferredLanguage(EMAIL, "ta");

        assertThat(saved).isEqualTo("ta");
        assertThat(user.getPreferredLanguage()).isEqualTo("ta");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void readsBackTheStoredLanguage() {
        existingUser("mr");

        assertThat(profileService.getPreferredLanguage(EMAIL)).contains("mr");
    }

    @Test
    void reportsNoPreferenceWhenTheUserNeverChoseOne() {
        existingUser(null);

        assertThat(profileService.getPreferredLanguage(EMAIL)).isEmpty();
    }

    @Test
    void rejectsAnUnknownAccount() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> profileService.updatePreferredLanguage("nobody@example.com", "hi"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @ParameterizedTest
    @ValueSource(strings = {"en", "hi", "mr", "ta", "te"})
    void acceptsEveryLanguageTheInterfaceIsTranslatedInto(String language) {
        LanguagePreferenceRequest request = new LanguagePreferenceRequest();
        request.setLanguage(language);

        assertThat(validator.validate(request)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"gu", "fr", "en-IN", "EN", "", "  ", "'; DROP TABLE ny_user; --"})
    void rejectsLanguagesWithNoLocaleBundle(String language) {
        LanguagePreferenceRequest request = new LanguagePreferenceRequest();
        request.setLanguage(language);

        assertThat(validator.validate(request)).isNotEmpty();
    }
}
