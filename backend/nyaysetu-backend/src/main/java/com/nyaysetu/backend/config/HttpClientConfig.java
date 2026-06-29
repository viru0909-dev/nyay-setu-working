package com.nyaysetu.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;


@Configuration
public class HttpClientConfig {

    @Value("${http.client.connect-timeout-ms:5000}")
    private int connectTimeout;

    @Value("${http.client.read-timeout-ms:10000}")
    private int readTimeout;

    @Value("${http.client.max-retries:3}")
    private int maxRetries;

    /**
     * Forges a globally managed, centralized RestTemplate bean configured with 
     * strict connection/read timeouts and an interceptor layer for safe retries.
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        RestTemplate restTemplate = builder
                .connectTimeout(Duration.ofMillis(connectTimeout))
                .readTimeout(Duration.ofMillis(readTimeout))
                .build();

        // Enforce fallback request factory properties explicitly
        if (restTemplate.getRequestFactory() instanceof SimpleClientHttpRequestFactory) {
            SimpleClientHttpRequestFactory factory = (SimpleClientHttpRequestFactory) restTemplate.getRequestFactory();
            factory.setConnectTimeout(connectTimeout);
            factory.setReadTimeout(readTimeout);
        }

        // Wire up an atomic retry interceptor loop for transient network errors
        List<ClientHttpRequestInterceptor> interceptors = restTemplate.getInterceptors();
        if (interceptors == null) {
            interceptors = new ArrayList<>();
        }
        interceptors.add((request, body, execution) -> {
            int attempt = 0;
            org.springframework.http.client.ClientHttpResponse response = null;
            while (attempt < maxRetries) {
                try {
                    response = execution.execute(request, body);
                    boolean isIdempotent = isIdempotentMethod(request.getMethod());
                    if (response.getStatusCode().is2xxSuccessful() || !isIdempotent) {
                        return response;
                    }
                } catch (Exception e) {
                    attempt++;
                    if (attempt >= maxRetries) {
                        throw new RuntimeException("External service client communication fatal breakdown after " + attempt + " retry attempts.", e);
                    }
                }
            }
            return response;
        });
        restTemplate.setInterceptors(interceptors);

        return restTemplate;
    }

    /**
     * GET, HEAD, PUT, DELETE, OPTIONS, and TRACE are idempotent by HTTP spec.
     * POST and PATCH are not, so we never auto-retry them.
     */
    private boolean isIdempotentMethod(HttpMethod method) {
        return method == HttpMethod.GET
                || method == HttpMethod.HEAD
                || method == HttpMethod.PUT
                || method == HttpMethod.DELETE
                || method == HttpMethod.OPTIONS
                || method == HttpMethod.TRACE;
    }
}
