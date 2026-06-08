package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {
    private static final String GOOGLE_JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";
    private static final String GOOGLE_PROVIDER = "google";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Value("${google.client.id:}")
    private String googleClientId;

    private final NimbusJwtDecoder googleJwtDecoder = NimbusJwtDecoder.withJwkSetUri(GOOGLE_JWKS_URI).build();

    public Map<String, Object> authenticate(String credential) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new IllegalStateException("Google OAuth is not configured");
        }

        Jwt jwt = decodeCredential(credential);
        validateGoogleToken(jwt);

        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        String picture = jwt.getClaimAsString("picture");

        if (email == null || email.isBlank()) {
            throw new JwtException("Google account did not provide an email address");
        }

        User user = userRepository.findByEmail(email)
                .map(existing -> syncGoogleProfile(existing, name, picture))
                .orElseGet(() -> createGoogleUser(email, name, picture));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(new HashMap<>(), userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("accessToken", token);
        response.put("refreshToken", refreshToken);
        response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "avatarUrl", user.getAvatarUrl() == null ? "" : user.getAvatarUrl()
        ));
        return response;
    }

    private Jwt decodeCredential(String credential) {
        try {
            return googleJwtDecoder.decode(credential);
        } catch (JwtException ex) {
            throw new JwtException("Invalid Google credential", ex);
        }
    }

    private void validateGoogleToken(Jwt jwt) {
        String issuer = jwt.getIssuer() == null ? "" : jwt.getIssuer().toString();
        if (!issuer.equals("https://accounts.google.com") && !issuer.equals("accounts.google.com")) {
            throw new JwtException("Invalid Google token issuer");
        }

        List<String> audience = jwt.getAudience();
        if (audience == null || !audience.contains(googleClientId)) {
            throw new JwtException("Invalid Google token audience");
        }

        Boolean emailVerified = jwt.getClaimAsBoolean("email_verified");
        if (!Boolean.TRUE.equals(emailVerified)) {
            throw new JwtException("Google account email is not verified");
        }
    }

    private User createGoogleUser(String email, String name, String picture) {
        User user = new User();
        user.setEmail(email);
        user.setName(resolveName(name, email));
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(Role.LITIGANT);
        user.setAvatarUrl(picture);
        user.setIsOAuth(true);
        user.setOauthProvider(GOOGLE_PROVIDER);
        return userRepository.save(user);
    }

    private User syncGoogleProfile(User user, String name, String picture) {
        boolean changed = false;
        String resolvedName = resolveName(name, user.getEmail());

        if (!Objects.equals(user.getName(), resolvedName)) {
            user.setName(resolvedName);
            changed = true;
        }

        if (!Objects.equals(user.getAvatarUrl(), picture)) {
            user.setAvatarUrl(picture);
            changed = true;
        }

        if (!Boolean.TRUE.equals(user.getIsOAuth())) {
            user.setIsOAuth(true);
            changed = true;
        }

        if (!GOOGLE_PROVIDER.equals(user.getOauthProvider())) {
            user.setOauthProvider(GOOGLE_PROVIDER);
            changed = true;
        }

        return changed ? userRepository.save(user) : user;
    }

    private String resolveName(String name, String email) {
        if (name != null && !name.isBlank()) {
            return name;
        }
        return email.substring(0, email.indexOf('@'));
    }
}
