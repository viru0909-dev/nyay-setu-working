package com.nyaysetu.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        // Clear authorization cookies
        new HttpCookieOAuth2AuthorizationRequestRepository().removeAuthorizationRequestCookies(request, response);

        String errorType = "oauth_failed";
        if (exception.getCause() != null && exception.getCause().getMessage() != null) {
            String causeMsg = exception.getCause().getMessage();
            if (causeMsg.contains("already registered with password")) {
                errorType = "email_registered_local";
            }
        } else if (exception.getMessage() != null && exception.getMessage().contains("already registered with password")) {
            errorType = "email_registered_local";
        }

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .path("/login")
                .queryParam("error", errorType)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
