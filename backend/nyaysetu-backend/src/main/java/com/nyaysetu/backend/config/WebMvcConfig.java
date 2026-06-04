package com.nyaysetu.backend.config;

import org.springframework.context.annotation.Configuration;

/**
 * Intentionally empty.
 *
 * Earlier versions attempted to dynamically prefix controller mappings with
 * "/api/v1" via PathMatchConfigurer. That approach is fragile with Spring MVC
 * controller metadata and can prevent the application context from loading
 * correctly in integration tests.
 *
 * Prefixing is now handled via server.servlet.context-path.
 */
@Configuration
public class WebMvcConfig {
}

