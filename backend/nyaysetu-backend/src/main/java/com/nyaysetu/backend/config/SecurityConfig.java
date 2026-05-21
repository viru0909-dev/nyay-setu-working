package com.nyaysetu.backend.config;

import com.nyaysetu.backend.filter.JwtAuthFilter;
import com.nyaysetu.backend.filter.RateLimitFilter;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
    private static final String DEFAULT_JWT_SECRET = "nyaysetu-2024-secure-jwt-signing-key-minimum-256-bits-required";

    private final UserDetailsService userDetailsService;
    private final RateLimitFilter rateLimitFilter;
    private final Environment environment;

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @PostConstruct
    public void validateJwtSecretConfiguration() {
        boolean isProd = java.util.Arrays.stream(environment.getActiveProfiles())
                .anyMatch("prod"::equalsIgnoreCase);
        boolean isDev = java.util.Arrays.stream(environment.getActiveProfiles())
                .anyMatch("dev"::equalsIgnoreCase);
        String jwtSecretEnv = System.getenv("JWT_SECRET");
        boolean isJwtSecretEnvMissing = jwtSecretEnv == null || jwtSecretEnv.trim().isEmpty();
        boolean isUsingDefaultSecret = DEFAULT_JWT_SECRET.equals(jwtSecret);

        if (isProd && (isJwtSecretEnvMissing || isUsingDefaultSecret)) {
            throw new IllegalStateException(
                    "Security configuration error: JWT_SECRET environment variable is required in production. "
                            + "Application startup is blocked to prevent using an insecure default JWT signing key.");
        }

        if (isDev && isUsingDefaultSecret) {
            logger.warn("JWT secret is using the default fallback value. Set JWT_SECRET in your environment for safer development setup.");
        }
    }

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

        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            java.util.List<String> origins = java.util.Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(java.util.stream.Collectors.toList());

            if (origins.isEmpty()) {
                configuration.setAllowedOrigins(java.util.Arrays.asList("http://localhost:5173", "http://localhost:3000"));
                configuration.setAllowCredentials(true);
            } else {
                boolean hasBareWildcard = origins.stream().anyMatch(o -> o.trim().equals("*"));
                if (hasBareWildcard) {
                    java.util.logging.Logger.getLogger("SecurityConfig")
                        .warning("CORS_ALLOWED_ORIGINS contains bare '*'. Falling back to localhost defaults.");
                    configuration.setAllowedOrigins(java.util.Arrays.asList("http://localhost:5173", "http://localhost:3000"));
                } else {
                    boolean hasPattern = origins.stream().anyMatch(o -> o.contains("*"));
                    if (hasPattern) {
                        configuration.setAllowedOriginPatterns(origins);
                    } else {
                        configuration.setAllowedOrigins(origins);
                    }
                }
                configuration.setAllowCredentials(true);
            }
        } else {
            configuration.setAllowedOrigins(java.util.Arrays.asList("http://localhost:5173", "http://localhost:3000"));
            configuration.setAllowCredentials(true);
        }

        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Explicit allowlist instead of wildcard "*" — prevents X-Forwarded-For spoofing from browser
        configuration.setAllowedHeaders(java.util.Arrays.asList(
            "Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "Cache-Control"
        ));

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // ── Public: auth endpoints ──────────────────────────────────────
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/ping",
                    "/api/auth/test",
                    "/api/auth/forgot-password",
                    "/api/auth/verify-reset-token",
                    "/api/auth/reset-password",
                    "/api/auth/face/login"
                ).permitAll()
                // ── Public: docs & health ───────────────────────────────────────
                .requestMatchers(
                    "/actuator/health",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**"
                ).permitAll()
                // ── Role-restricted endpoints ───────────────────────────────────
                // SECURITY FIX (P0 Finding 1 & 6): police and judge endpoints
                // were fully public. Now require proper role assignment.
                .requestMatchers("/api/police/**").hasAnyRole("POLICE", "ADMIN")
                .requestMatchers("/api/judge/**").hasAnyRole("JUDGE", "ADMIN")
                // ── Everything else requires a valid JWT ────────────────────────
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
