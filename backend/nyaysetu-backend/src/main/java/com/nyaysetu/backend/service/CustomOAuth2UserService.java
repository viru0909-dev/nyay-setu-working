package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.AuthProvider;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        OAuth2User oauthUser = super.loadUser(userRequest);

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String providerId = oauthUser.getAttribute("sub");

        User user = userRepository.findByEmail(email)
                .map(existingUser -> {

                    // LOCAL account exists → block Google login
                    if (existingUser.getAuthProvider() == AuthProvider.LOCAL) {
                        throw new OAuth2AuthenticationException(
                                new OAuth2Error("account_exists"),
                                "An account with this email already exists. Please login with your password."
                        );
                    }

                    // Existing GOOGLE user → allow login
                    return existingUser;
                })
                .orElseGet(() -> {

                    // New GOOGLE user
                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .password(null)
                            .role(Role.LITIGANT)
                            .authProvider(AuthProvider.GOOGLE)
                            .providerId(providerId)
                            .build();

                    return userRepository.save(newUser);
                });
        return oauthUser;
    }
}