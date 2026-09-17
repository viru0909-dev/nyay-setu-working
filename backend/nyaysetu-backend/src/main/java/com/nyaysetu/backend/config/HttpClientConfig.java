package com.nyaysetu.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

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
     * Provides a centralized RestTemplate bean with explicit timeouts
     * and a retry interceptor for transient network errors.
     *
     * Note: RestTemplateBuilder injection was removed in Spring Boot 4.
     * RestTemplate is constructed directly via SimpleClientHttpRequestFactory.
     */
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);

        RestTemplate restTemplate = new RestTemplate(factory);

        List<ClientHttpRequestInterceptor> interceptors = new ArrayList<>(restTemplate.getInterceptors());
        interceptors.add((request, body, execution) -> {
            int attempt = 0;
            ClientHttpResponse response = null;
            while (attempt < maxRetries) {
                try {
                    response = execution.execute(request, body);
                    boolean idempotent = isIdempotentMethod(request.getMethod());
                    if (response.getStatusCode().is2xxSuccessful() || !idempotent) {
                        return response;
                    }
                } catch (Exception e) {
                    attempt++;
                    if (attempt >= maxRetries) {
                        throw new RuntimeException(
                                "HTTP client fatal breakdown after " + attempt + " retry attempts.", e);
                    }
                }
                attempt++;
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
