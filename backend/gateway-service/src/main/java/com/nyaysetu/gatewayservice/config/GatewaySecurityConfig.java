package com.nyaysetu.gatewayservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {

        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(ServerHttpSecurity.CorsSpec::disable)
                .authorizeExchange(ex -> ex
                        .pathMatchers("/auth/**").permitAll()   // FIRST rule
                        .anyExchange().authenticated()          // THEN catch-all
                )
                .oauth2ResourceServer(oauth -> oauth.jwt());

        return http.build();
    }


    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        String secret = "4YMH8Dj0nsCFZvejRddrFBuF6eiHihhfaTD2iJd6T1M="; // SAME KEY used in auth-service
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        return NimbusReactiveJwtDecoder.withSecretKey(secretKey).build();
    }


}