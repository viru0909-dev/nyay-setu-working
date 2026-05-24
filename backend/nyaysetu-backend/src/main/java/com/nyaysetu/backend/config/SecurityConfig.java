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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
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

                        // ── Public endpoints ──────────────────────────────────────────────
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/forgot-password",
                                "/api/auth/verify-reset-token",
                                "/api/auth/reset-password",
                                "/api/auth/face/login",
                                "/api/auth/ping",
                                "/api/auth/test",
                                "/api/health",
                                "/api/police/health"
                        ).permitAll()

                        // ── WebSocket endpoints ───────────────────────────────────────────
                        .requestMatchers("/api/ws/**").permitAll()

                        // ── AI endpoints (open for now; restrict if misuse detected) ──────
                        .requestMatchers(
                                "/ai/summarize",
                                "/ai/chat",
                                "/ai/chat/ollama",
                                "/ai/constitution/qa",
                                "/ai/ollama/status",
                                "/ai/ollama/models",
                                "/api/brain/analyze-case",
                                "/api/brain/suggest-documents"
                        ).permitAll()

                        // ── Auth-only: any authenticated user ─────────────────────────────
                        .requestMatchers(
                                "/api/auth/face/enroll",
                                "/api/auth/face/disable",
                                "/api/auth/face/status",
                                "/api/face/enroll",
                                "/api/face/verify",
                                "/api/face/status",
                                "/api/face/remove",
                                "/profile/**"
                        ).authenticated()

                        // ── Brain / AI (authenticated) ────────────────────────────────────
                        .requestMatchers("/api/brain/**").authenticated()

                        // ── Judge-only endpoints ──────────────────────────────────────────
                        .requestMatchers(
                                "/api/judge/**",
                                "/api/hearings/schedule",
                                "/api/hearings/*/complete",
                                "/api/hearings/*/outcome",
                                "/api/hearings/*/participants",
                                "/api/orders",
                                "/api/orders/*",
                                "/api/orders/my-orders",
                                "/api/cases/*/assign-judge",
                                "/api/cases/*/take-cognizance",
                                "/api/cases/*/order-notice",
                                "/api/cases/transition/*/take-cognizance",
                                "/api/cases/transition/*/advance-stage"
                        ).hasAnyRole("JUDGE", "SUPER_JUDGE", "ADMIN")

                        // ── Police-only endpoints ─────────────────────────────────────────
                        .requestMatchers(
                                "/api/police/summons/**",
                                "/api/police/fir/**",
                                "/api/police/investigation/**",
                                "/api/police/stats"
                        ).hasAnyRole("POLICE", "ADMIN")

                        // ── Lawyer-only endpoints ─────────────────────────────────────────
                        .requestMatchers(
                                "/api/lawyer/**",
                                "/api/cases/transition/*/save-draft"
                        ).hasAnyRole("LAWYER", "ADMIN")

                        // ── Litigant endpoints ────────────────────────────────────────────
                        .requestMatchers(
                                "/api/client/fir/**",
                                "/api/cases/transition/*/approve-draft",
                                "/api/cases/transition/*/reject-draft"
                        ).hasAnyRole("LITIGANT", "ADMIN")

                        // ── Admin/oversight-only endpoints ────────────────────────────────
                        .requestMatchers(
                                "/api/cases/pending-assignment",
                                "/api/cases/judge-workload",
                                "/verify/admin/**",
                                "/api/audit/log"
                        ).hasAnyRole("ADMIN", "SUPER_JUDGE", "TECH_ADMIN")

                        // ── Summons & transition (police + judge + admin) ──────────────────
                        .requestMatchers(
                                "/api/cases/*/update-summons",
                                "/api/cases/transition/*/summons-served"
                        ).hasAnyRole("POLICE", "JUDGE", "SUPER_JUDGE", "ADMIN")

                        // ── Everything else requires authentication ────────────────────────
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
