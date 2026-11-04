package com.nyaysetu.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger UI configuration for the NyaySetu backend.
 *
 * <p>Exposes:</p>
 * <ul>
 *   <li>Swagger UI  — {@code /swagger-ui/index.html}</li>
 *   <li>OpenAPI JSON — {@code /v3/api-docs}</li>
 *   <li>OpenAPI YAML — {@code /v3/api-docs.yaml}</li>
 * </ul>
 *
 * <p>All application REST controllers live under the global {@code /api/v1} prefix
 * applied by {@link WebMvcConfig}. Swagger's own springdoc controllers are in the
 * {@code org.springdoc} package and therefore are NOT affected by that prefix.</p>
 *
 * <p>JWT Bearer authentication is declared here so that Swagger UI renders an
 * "Authorize" button allowing developers to supply a token and test protected APIs
 * directly from the browser.</p>
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    /**
     * Primary OpenAPI metadata bean.
     *
     * <ul>
     *   <li>Sets the API title, description, version, and contact.</li>
     *   <li>Registers the HTTP Bearer JWT security scheme under the name
     *       {@code bearerAuth}.</li>
     *   <li>Applies the scheme globally so that every generated operation
     *       shows the padlock icon in Swagger UI.</li>
     * </ul>
     *
     * <p>Public endpoints (login, register, health, Swagger itself) are annotated
     * with {@code @SecurityRequirements} (empty) in their respective controllers,
     * which overrides this global requirement and removes the padlock for those
     * specific operations.</p>
     */
    @Bean
    public OpenAPI nyaySetuOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Nyay Setu API Documentation")
                        .description(
                                "Interactive API documentation for the Nyay Setu Digital Judiciary Platform. "
                                + "Use the Authorize button to supply your JWT Bearer token and test "
                                + "protected endpoints directly from the browser."
                        )
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("NyaySetu Team")))
                .components(new Components()
                        .addSecuritySchemes(
                                SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description(
                                                "Enter the JWT token obtained from POST /api/v1/auth/login. "
                                                + "Do NOT include the 'Bearer ' prefix — Swagger adds it automatically."
                                        )
                        ))
                .addSecurityItem(
                        new SecurityRequirement().addList(SECURITY_SCHEME_NAME)
                );
    }

    /**
     * Groups all controllers under the {@code com.nyaysetu.backend.controller} package
     * into a single Swagger API group. This is the complete set of NyaySetu REST endpoints.
     */
    @Bean
    public GroupedOpenApi nyaySetuApiGroup() {
        return GroupedOpenApi.builder()
                .group("nyaysetu-backend")
                .packagesToScan("com.nyaysetu.backend.controller")
                .build();
    }
}
