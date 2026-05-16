package com.nyaysetu.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "NyaySetu API",
                version = "1.0.0",
                description = "REST API documentation for the NyaySetu Digital Judiciary Platform. " +
                        "Provides endpoints for case management, FIR filing, AI legal assistance, " +
                        "hearings, evidence vault, and user authentication.",
                contact = @Contact(name = "NyaySetu Team")
        )
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Enter your JWT token obtained from /api/auth/login"
)
public class OpenApiConfig {
    // Configuration is handled via annotations above
}
