package com.nyaysetu.backend.config;

import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

    private final JwtService jwtService;
    private final AuthService authService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        DefaultOAuth2User oauthUser = (DefaultOAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name  = oauthUser.getAttribute("name");

        // Look up the persisted user (created/updated by CustomOAuth2UserService).
        User dbUser = authService.findByEmail(email);

        if (dbUser == null) {
            // Should not happen — CustomOAuth2UserService always upserts the user.
            // Defensive guard to avoid a NullPointerException and redirect gracefully.
            logger.error("OAuthSuccess: no DB user found for email={}", email);
            response.sendRedirect(frontendUrl + "/login?error=user_not_found");
            return;
        }

        String role = dbUser.getRole().name(); // e.g. "LITIGANT"

        // Build extra claims map including the role so the JWT carries authority info.
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", role);

        // Build a UserDetails with the correct GrantedAuthority so any downstream
        // role-extraction from the JWT works correctly.
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                email,
                "",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
        );

        String jwtToken = jwtService.generateToken(extraClaims, userDetails);

        response.sendRedirect(
                frontendUrl + "/oauth-success"
                        + "?token=" + jwtToken
                        + "&email=" + email
                        + "&name=" + java.net.URLEncoder.encode(name != null ? name : "", "UTF-8")
                        + "&role=" + role
        );
    }
}