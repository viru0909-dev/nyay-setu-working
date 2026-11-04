package com.nyaysetu.backend.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests verifying the Swagger UI / OpenAPI documentation endpoints introduced
 * in GitHub Issue #1648.
 *
 * <p>Runs against the full Spring application context (including the real
 * {@link com.nyaysetu.backend.config.SecurityConfig} and
 * {@link com.nyaysetu.backend.filter.JwtAuthFilter}) so that we confirm:
 * <ol>
 *   <li>Swagger/OpenAPI endpoints are publicly reachable without a JWT token.</li>
 *   <li>The generated spec contains the expected API title and JWT security scheme.</li>
 *   <li>The global {@code /api/v1} prefix is in effect for application controllers.</li>
 *   <li>Protected application endpoints still reject unauthenticated requests.</li>
 * </ol>
 *
 * <p>The test profile (src/test/resources/application.properties) points to an in-memory
 * H2 database and disables Flyway, so no external PostgreSQL instance is required.</p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SwaggerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    // ──────────────────────────────────────────────────────────────────────────────
    // 1. Swagger UI is reachable without authentication
    // ──────────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /swagger-ui/index.html → 200 OK without JWT (redirect from /swagger-ui.html)")
    void swaggerUiIndex_shouldBeAccessibleWithoutJwt() throws Exception {
        // springdoc redirects /swagger-ui.html → /swagger-ui/index.html;
        // following the redirect should ultimately return 200 with HTML content.
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /swagger-ui.html → redirect (3xx) without JWT")
    void swaggerUiHtml_shouldRedirectWithoutJwt() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().is3xxRedirection());
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 2. OpenAPI JSON endpoint is reachable without authentication
    // ──────────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /v3/api-docs → 200 OK with JSON content-type, no JWT required")
    void openApiJson_shouldReturn200WithoutJwt() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /v3/api-docs → response contains 'Nyay Setu API Documentation' title")
    void openApiJson_shouldContainExpectedTitle() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("Nyay Setu API Documentation"));
    }

    @Test
    @DisplayName("GET /v3/api-docs → response contains API version 1.0.0")
    void openApiJson_shouldContainExpectedVersion() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.version").value("1.0.0"));
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 3. JWT Bearer security scheme is declared in the generated spec
    // ──────────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /v3/api-docs → security scheme 'bearerAuth' is declared as HTTP bearer JWT")
    void openApiJson_shouldDeclareBearerAuthSecurityScheme() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth").exists())
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.type").value("http"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.bearerFormat").value("JWT"));
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 4. OpenAPI YAML endpoint is reachable without authentication
    // ──────────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /v3/api-docs.yaml → 200 OK without JWT")
    void openApiYaml_shouldReturn200WithoutJwt() throws Exception {
        mockMvc.perform(get("/v3/api-docs.yaml"))
                .andExpect(status().isOk());
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 5. Global /api/v1 prefix is applied to application controller routes
    // ──────────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /v3/api-docs → application paths contain the /api/v1 prefix")
    void openApiJson_shouldContainApiV1PrefixedPaths() throws Exception {
        // The health endpoint is a publicly accessible route; its generated path
        // must carry the /api/v1 prefix applied by WebMvcConfig.
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("/api/v1/")));
    }

    @Test
    @DisplayName("GET /api/v1/health → 200 OK (prefix + controller mapping work together)")
    void healthEndpoint_shouldBeReachableViaApiV1Prefix() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk());
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 6. Protected application endpoints still require authentication
    // ──────────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/v1/cases (protected) → 401 or 302 without JWT (no authenticated session)")
    void protectedCasesEndpoint_shouldReturn401WithoutJwt() throws Exception {
        // With spring-boot-starter-oauth2-client on the classpath, Spring Security may redirect
        // unauthenticated requests to the OAuth2 login page (302) rather than returning a bare 401.
        // Either response correctly demonstrates that the endpoint is protected.
        mockMvc.perform(get("/api/v1/cases"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(
                        status == 401 || status == 302,
                        "Expected 401 Unauthorized or 302 redirect to login, but got: " + status
                    );
                });
    }
}
