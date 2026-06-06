package com.nyaysetu.backend.filter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.Refill;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * RateLimitFilter
 *
 * Protects authentication endpoints from:
 * - Brute-force attacks
 * - Credential stuffing attacks
 *
 * Strategy:
 * - IP-based rate limiting
 * - Bucket4j token bucket algorithm
 * - 5 requests per minute per IP
 *
 * Protected endpoints:
 * - /api/v1/auth/login
 * - /api/v1/auth/register
 * - /api/v1/auth/forgot-password
 */
@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    /**
     * Stores token buckets for each client IP.
     * ConcurrentHashMap ensures thread safety.
     */
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    /**
     * Maximum allowed requests per minute.
     */
    private static final int REQUESTS_PER_MINUTE = 5;

    /**
     * Refill duration in minutes.
     */
    private static final long REFILL_DURATION_MINUTES = 1;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Apply rate limiting only to login and register endpoints
        if (isRateLimitedEndpoint(requestPath)) {

            String clientIp = getClientIp(request);

            // Create bucket for new IP or reuse existing one
            Bucket bucket = cache.computeIfAbsent(
                    clientIp,
                    ip -> createNewBucket()
            );

            // Try consuming one token
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

            if (probe.isConsumed()) {

                long remainingTokens = probe.getRemainingTokens();

                // Rate limit headers
                response.setHeader(
                        "X-RateLimit-Limit",
                        String.valueOf(REQUESTS_PER_MINUTE)
                );

                response.setHeader(
                        "X-RateLimit-Remaining",
                        String.valueOf(remainingTokens)
                );

                response.setHeader(
                        "X-RateLimit-Reset",
                        String.valueOf(System.currentTimeMillis() + 60000)
                );

                log.debug(
                        "Rate limit passed for IP: {} on endpoint: {} | Remaining tokens: {}",
                        clientIp,
                        requestPath,
                        remainingTokens
                );

                // Continue request processing
                filterChain.doFilter(request, response);

            } else {

                // Time remaining before next refill
                long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;

                log.warn(
                        "Rate limit exceeded for IP: {} on endpoint: {}",
                        clientIp,
                        requestPath
                );

                // Return HTTP 429
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");

                // Rate limit headers
                response.setHeader(
                        "X-RateLimit-Limit",
                        String.valueOf(REQUESTS_PER_MINUTE)
                );

                response.setHeader(
                        "X-RateLimit-Remaining",
                        "0"
                );

                response.setHeader(
                        "Retry-After",
                        String.valueOf(waitForRefill)
                );

                response.setHeader(
                        "X-RateLimit-Reset",
                        String.valueOf(System.currentTimeMillis() + (waitForRefill * 1000))
                );

                // JSON error response
                String errorResponse = String.format(
                        "{\"message\":\"Too many requests. Please try again after %d seconds.\",\"retryAfter\":%d}",
                        waitForRefill,
                        waitForRefill
                );

                response.getWriter().write(errorResponse);
                response.getWriter().flush();
            }

        } else {
            // Non-auth endpoints bypass rate limiting
            filterChain.doFilter(request, response);
        }
    }

    /**
     * Creates a token bucket with:
     * - Capacity: 5 requests
     * - Refill: every 1 minute
     */
    private Bucket createNewBucket() {

        Bandwidth limit = Bandwidth.classic(
                REQUESTS_PER_MINUTE,
                Refill.intervally(
                        REQUESTS_PER_MINUTE,
                        Duration.ofMinutes(REFILL_DURATION_MINUTES)
                )
        );

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Checks whether current endpoint
     * should be protected by rate limiting.
     */
    private boolean isRateLimitedEndpoint(String path) {

        return path.matches("^/api/v1/auth/(login|register|forgot-password)$");
    }

    /**
     * Extracts client IP address.
     *
     * Supports:
     * - X-Forwarded-For
     * - X-Real-IP
     */
    private String getClientIp(HttpServletRequest request) {

        String xForwardedFor = request.getHeader("X-Forwarded-For");

        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");

        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}