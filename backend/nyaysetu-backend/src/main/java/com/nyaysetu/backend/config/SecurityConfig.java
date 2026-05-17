package com.nyaysetu.backend.config;

import com.nyaysetu.backend.filter.JwtAuthFilter;
import com.nyaysetu.backend.filter.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final RateLimitFilter rateLimitFilter;

    @org.springframework.beans.factory.annotation.Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        
        // Use origins from application.properties / Env Var
        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            java.util.List<String> origins = java.util.Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(java.util.stream.Collectors.toList());

            if (origins.isEmpty()) {
                // SAFE DEFAULT: Allow local development origins only
                configuration.setAllowedOrigins(java.util.Arrays.asList(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "http://localhost"
                ));
                configuration.setAllowCredentials(true);
            } else {
                // Security: reject bare "*" — it allows any origin to make credentialed requests
                boolean hasBareWildcard = origins.stream().anyMatch(o -> o.trim().equals("*"));
                if (hasBareWildcard) {
                    java.util.logging.Logger.getLogger("SecurityConfig")
                        .warning("CORS_ALLOWED_ORIGINS contains bare '*'. "
                            + "This is unsafe with credentials. Falling back to localhost defaults.");
                    configuration.setAllowedOrigins(java.util.Arrays.asList(
                        "http://localhost:5173",
                        "http://localhost:3000",
                        "http://localhost"
                    ));
                } else {
                    boolean hasPattern = origins.stream().anyMatch(o -> o.contains("*"));
                    if (hasPattern) {
                        // Specific patterns like https://*.example.com are safe with credentials
                        configuration.setAllowedOriginPatterns(origins);
                    } else {
                        configuration.setAllowedOrigins(origins);
                    }
                }
                configuration.setAllowCredentials(true);
            }
        } else {
            // SAFE DEFAULT: Allow local development origins only
            configuration.setAllowedOrigins(java.util.Arrays.asList(
                "http://localhost:5173", 
                "http://localhost:3000", 
                "http://localhost"
            ));
            configuration.setAllowCredentials(true);
        }
        
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
        
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthFilter jwtAuthFilter) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}