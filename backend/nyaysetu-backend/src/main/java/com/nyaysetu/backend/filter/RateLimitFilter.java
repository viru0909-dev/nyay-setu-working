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

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.concurrent.TimeUnit;

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
     * Caffeine cache with automatic expiry.
     */
    private final Cache<String, Bucket> cache = Caffeine.newBuilder()
            .maximumSize(100_000)
            .expireAfterAccess(2, TimeUnit.MINUTES)
            .build();

    /**
     * Maximum allowed requests per minute.
     */
    private static final int REQUESTS_PER_MINUTE = 5;

    /**
     * Refill duration in minutes.
     */
    private static final long REFILL_DURATION_MINUTES = 1;

    /**
     * Rate limits for AI endpoints (per authenticated user).
     */
    private static final int AI_CHAT_REQUESTS_PER_MINUTE = 20;
    private static final int AI_DOC_REQUESTS_PER_MINUTE = 5;

    /**
     * Separate per-user buckets for AI endpoints.
     */
    private final Map<String, Bucket> chatBucketCache = new ConcurrentHashMap<>();
    private final Map<String, Bucket> docBucketCache = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // --- Existing: Auth endpoint rate limiting (IP-based) ---
        if (isRateLimitedEndpoint(requestPath)) {

            String clientIp = getClientIp(request);

            // Use Caffeine's get(key, mappingFunction) — NOT computeIfAbsent
            Bucket bucket = cache.get(clientIp, ip -> createNewBucket());

            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

            if (probe.isConsumed()) {
                long remainingTokens = probe.getRemainingTokens();
                response.setHeader("X-RateLimit-Limit", String.valueOf(REQUESTS_PER_MINUTE));
                response.setHeader("X-RateLimit-Remaining", String.valueOf(remainingTokens));
                response.setHeader("X-RateLimit-Reset", String.valueOf(System.currentTimeMillis() + 60000));
                log.debug("Rate limit passed for IP: {} on endpoint: {} | Remaining tokens: {}", clientIp, requestPath, remainingTokens);
                filterChain.doFilter(request, response);

            } else {
                long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
                log.warn("Rate limit exceeded for IP: {} on endpoint: {}", clientIp, requestPath);
                writeRateLimitResponse(response, waitForRefill, REQUESTS_PER_MINUTE);
            }

        // --- NEW: AI endpoint rate limiting (per authenticated user) ---
        } else if (isAiChatEndpoint(requestPath) || isAiDocEndpoint(requestPath)) {

            String userId = extractUserId(request);

            Map<String, Bucket> bucketCache = isAiChatEndpoint(requestPath) ? chatBucketCache : docBucketCache;
            int limit = isAiChatEndpoint(requestPath) ? AI_CHAT_REQUESTS_PER_MINUTE : AI_DOC_REQUESTS_PER_MINUTE;

            Bucket bucket = bucketCache.computeIfAbsent(userId, id -> createBucketWithLimit(limit));
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

            if (probe.isConsumed()) {
                response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
                response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
                log.debug("AI rate limit passed for user: {} on endpoint: {}", userId, requestPath);
                filterChain.doFilter(request, response);
            } else {
                long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
                log.warn("AI rate limit exceeded for user: {} on endpoint: {}", userId, requestPath);
                writeRateLimitResponse(response, waitForRefill, limit);
            }

        } else {
            // Non-rate-limited endpoints pass through
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

    /**
     * Checks if endpoint is the Vakil Friend chat endpoint.
     */
    private boolean isAiChatEndpoint(String path) {
        return path.startsWith("/api/vakil-friend/chat");
    }

    /**
     * Checks if endpoint is a document analysis endpoint.
     */
    private boolean isAiDocEndpoint(String path) {
        return path.startsWith("/api/vakil-friend/analyze")
                || path.startsWith("/api/evidence/upload");
    }

    /**
     * Creates a bucket with a custom per-minute limit.
     */
    private Bucket createBucketWithLimit(int requestsPerMinute) {
        Bandwidth limit = Bandwidth.classic(
                requestsPerMinute,
                Refill.intervally(requestsPerMinute, Duration.ofMinutes(1))
        );
        return Bucket.builder().addLimit(limit).build();
    }

    /**
     * Extracts authenticated user ID from JWT principal.
     * Falls back to IP address if user is not authenticated.
     */
    private String extractUserId(HttpServletRequest request) {
        if (request.getUserPrincipal() != null) {
            return "user:" + request.getUserPrincipal().getName();
        }
        return "ip:" + getClientIp(request);
    }

    /**
     * Writes a standard HTTP 429 JSON response.
     */
    private void writeRateLimitResponse(HttpServletResponse response, long waitSeconds, int limit) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setHeader("Retry-After", String.valueOf(waitSeconds));
        response.setHeader("X-RateLimit-Reset", String.valueOf(System.currentTimeMillis() + (waitSeconds * 1000)));

        String errorResponse = String.format(
                "{\"message\":\"Too many requests. Please try again after %d seconds.\",\"retryAfter\":%d}",
                waitSeconds, waitSeconds
        );
        response.getWriter().write(errorResponse);
        response.getWriter().flush();
    }
}