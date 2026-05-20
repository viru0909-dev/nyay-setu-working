package com.nyaysetu.backend.config;

import com.nyaysetu.backend.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;


import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.entity.User;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final AuthService authService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        DefaultOAuth2User oauthUser =
                (DefaultOAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        System.out.println("EMAIL: " + email);
        System.out.println("NAME: " + name);

        String jwtToken = jwtService.generateToken(
                new HashMap<>(),
                new org.springframework.security.core.userdetails.User(
                        email,
                        "",
                        java.util.Collections.emptyList()
                )
        );

        System.out.println("JWT TOKEN: " + jwtToken);

        User dbUser = authService.findByEmail(email);

        String role = dbUser.getRole().name();

        response.sendRedirect(
                "http://localhost:5173/oauth-success"
                        + "?token=" + jwtToken
                        + "&email=" + email
                        + "&name=" + java.net.URLEncoder.encode(name, "UTF-8")
                        + "&role=" + role
        );
    }
}