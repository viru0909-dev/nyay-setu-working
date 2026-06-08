package com.nyaysetu.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * Provides a shared, configured RestTemplate bean with explicit timeouts.
 *
 * All services making outbound HTTP calls (Groq, Bhashini, etc.) should
 * inject this bean rather than constructing `new RestTemplate()`, which
 * defaults to infinite connect/read timeouts and can exhaust the Tomcat
 * thread pool under concurrent AI load.
 *
 * Connect timeout : 5s  — fail fast if the remote host is unreachable
 * Read timeout    : 30s — allow enough time for LLM inference (Groq p50 ~8s)
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);   // 5 seconds
        factory.setReadTimeout(30_000);     // 30 seconds
        return new RestTemplate(factory);
    }
}
