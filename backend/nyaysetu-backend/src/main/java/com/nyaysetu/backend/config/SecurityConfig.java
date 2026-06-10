package com.nyaysetu.backend.config;

import com.nyaysetu.backend.filter.JwtAuthFilter;

import com.nyaysetu.backend.filter.RateLimitFilter;
import com.nyaysetu.backend.filter.XssSanitizationFilter;
import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
<<<<<<< HEAD

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
=======
>>>>>>> origin/main

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
        boolean isDev = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(profile -> profile.equalsIgnoreCase("dev") || profile.equalsIgnoreCase("test"));
        String jwtSecretEnv = System.getenv("JWT_SECRET");
        boolean isJwtSecretEnvMissing = jwtSecretEnv == null || jwtSecretEnv.trim().isEmpty();
        boolean isUsingDefaultSecret = DEFAULT_JWT_SECRET.equals(jwtSecret);

        if (!isDev && (isJwtSecretEnvMissing || isUsingDefaultSecret)) {
            throw new IllegalStateException(
                    "Security configuration error: JWT_SECRET environment variable is required in non-development deployments. "
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
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
<<<<<<< HEAD


        // SAFE DEFAULT (Localhost fallback)
        List<String> defaultOrigins = Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost"
        );

        if (allowedOrigins != null && !allowedOrigins.trim().isEmpty()) {
=======
        
        // Use origins from application.properties / Env Var
        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
>>>>>>> origin/main
            List<String> origins = Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());

<<<<<<< HEAD
            if (origins.contains("*")) {
                // SECURITY: Reject bare "*" when credentials are true
                logger.warn("CORS_ALLOWED_ORIGINS contains bare '*'. This is unsafe with credentials. Falling back to localhost defaults.");
                configuration.setAllowedOrigins(defaultOrigins);
            } else if (origins.stream().anyMatch(o -> o.contains("*"))) {
                // Specific patterns like https://*.example.com are safe
                configuration.setAllowedOriginPatterns(origins);
            } else {
                // Exact valid domains
                configuration.setAllowedOrigins(origins);
            }
        } else {
            // Fallback if environment variable is missing
            configuration.setAllowedOrigins(defaultOrigins);
        }

        // SECURITY IMPROVEMENTS:
        // 1. Always allow credentials for the resolved safe origins
        configuration.setAllowCredentials(true);

        // 2. Add "PATCH" to allowed methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // 3. Restrict headers instead of using wildcard "*" for better security
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With"
        ));

=======
            if (origins.isEmpty()) {
                // SAFE DEFAULT: Allow local development origins only
                configuration.setAllowedOrigins(Arrays.asList(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "http://localhost"
                ));
                configuration.setAllowCredentials(true);
            } else {
                // Security: reject bare "*" — it allows any origin to make credentialed requests
                boolean hasBareWildcard = origins.stream().anyMatch(o -> o.trim().equals("*"));
                if (hasBareWildcard) {
                    logger.warn("CORS_ALLOWED_ORIGINS contains bare '*'. "
                            + "This is unsafe with credentials. Falling back to localhost defaults.");
                    configuration.setAllowedOrigins(Arrays.asList(
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
            configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173", 
                "http://localhost:3000", 
                "http://localhost"
            ));
            configuration.setAllowCredentials(true);
        }
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
>>>>>>> origin/main
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthFilter jwtAuthFilter,
            XssSanitizationFilter xssSanitizationFilter) throws Exception {

        http
                // 1. CORS fix (Restricting to specific origins instead of all)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.deny())
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives(
                                    "default-src 'self'; " +
                                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
                                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                                    "img-src 'self' data: https:; " +
                                    "font-src 'self' https://fonts.gstatic.com; " +
                                    "connect-src 'self' wss: https://cdn.jsdelivr.net https://nyaysetubackend.onrender.com; " +
                                    "frame-ancestors 'none'; " +
                                    "object-src 'none'; " +
                                    "base-uri 'self'; " +
                                    "form-action 'self'; " +
                                    "upgrade-insecure-requests"
                                ))
                                .referrerPolicy(rp -> rp.policy(
                                    org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN
                                ))
                                .permissionsPolicy(pp -> pp.policy(
                                    "geolocation=(), microphone=(), camera=(), payment=()"
                                ))
                )
                .authorizeHttpRequests(auth -> auth
<<<<<<< HEAD
                        // 2. Only strictly public endpoints allowed
                        .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/forgot-password").permitAll()
                        .requestMatchers("/api/health/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()

                        // 3. The exact fix for the bug: Everything else MUST be authenticated
                        .anyRequest().authenticated()
                )

=======
                        // ── Public endpoints ──────────────────────────────────────────────
                        .requestMatchers(
                                "/api/v1/auth/register",
                                "/api/v1/auth/login",
                                "/api/v1/auth/forgot-password",
                                "/api/v1/auth/verify-reset-token",
                                "/api/v1/auth/reset-password",
                                "/api/v1/auth/face/login",
                                "/api/v1/auth/ping",
                                "/api/v1/auth/test",
                                "/api/v1/health",
                                "/api/v1/police/health"
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
                                "/api/v1/brain/analyze-case",
                                "/api/v1/brain/suggest-documents"
                        ).permitAll()

                        // ── Auth-only: any authenticated user ─────────────────────────────
                        .requestMatchers(
                                "/api/v1/auth/face/enroll",
                                "/api/v1/auth/face/disable",
                                "/api/v1/auth/face/status",
                                "/api/v1/face/enroll",
                                "/api/v1/face/verify",
                                "/api/v1/face/status",
                                "/api/v1/face/remove",
                                "/profile/**"
                        ).authenticated()

                        // ── Brain / AI (authenticated) ────────────────────────────────────
                        .requestMatchers("/api/v1/brain/**").authenticated()

                        // ── Judge-only endpoints ──────────────────────────────────────────
                        .requestMatchers(
                                "/api/v1/judge/**",
                                "/api/v1/hearings/schedule",
                                "/api/v1/hearings/*/complete",
                                "/api/v1/hearings/*/outcome",
                                "/api/v1/hearings/*/participants",
                                "/api/v1/orders",
                                "/api/v1/orders/*",
                                "/api/v1/orders/my-orders",
                                "/api/v1/cases/*/assign-judge",
                                "/api/v1/cases/*/take-cognizance",
                                "/api/v1/cases/*/order-notice",
                                "/api/v1/cases/transition/*/take-cognizance",
                                "/api/v1/cases/transition/*/advance-stage"
                        ).hasAnyRole("JUDGE", "SUPER_JUDGE", "ADMIN")

                        // ── Police-only endpoints ─────────────────────────────────────────
                        .requestMatchers(
                                "/api/v1/police/summons/**",
                                "/api/v1/police/fir/**",
                                "/api/v1/police/investigation/**",
                                "/api/v1/police/stats"
                        ).hasAnyRole("POLICE", "ADMIN")

                        // ── Lawyer-only endpoints ─────────────────────────────────────────
                        .requestMatchers(
                                "/api/v1/lawyer/**",
                                "/api/v1/cases/transition/*/save-draft"
                        ).hasAnyRole("LAWYER", "ADMIN")

                        // ── Litigant endpoints ────────────────────────────────────────────
                        .requestMatchers(
                                "/api/v1/client/fir/**",
                                "/api/v1/cases/transition/*/approve-draft",
                                "/api/v1/cases/transition/*/reject-draft"
                        ).hasAnyRole("LITIGANT", "ADMIN")

                        // ── Admin/oversight-only endpoints ────────────────────────────────
                        .requestMatchers(
                                "/api/admin/**",
                                "/api/v1/cases/pending-assignment",
                                "/api/v1/cases/judge-workload",
                                "/verify/admin/**",
                                "/api/v1/audit/log"
                        ).hasAnyRole("ADMIN", "SUPER_JUDGE", "TECH_ADMIN")

                        // ── Summons & transition (police + judge + admin) ──────────────────
                        .requestMatchers(
                                "/api/v1/cases/*/update-summons",
                                "/api/v1/cases/transition/*/summons-served"
                        ).hasAnyRole("POLICE", "JUDGE", "SUPER_JUDGE", "ADMIN")

                        // ── Everything else requires authentication ────────────────────────
                        .anyRequest().authenticated()
                )
>>>>>>> origin/main
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(xssSanitizationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}