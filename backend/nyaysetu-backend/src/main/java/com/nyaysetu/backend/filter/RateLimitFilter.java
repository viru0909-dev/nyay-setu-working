package com.nyaysetu.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

/**
 * RateLimitFilter
 *
 * Distributed Redis-based Rate Limiter to protect endpoints from abuse, credential stuffing,
 * and high resource usage (DoS).
 */
@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    @Value("${rate.limit.enabled:true}")
    private boolean rateLimitEnabled;

    private static final int AUTH_LIMIT = 5;
    private static final int AI_CHAT_LIMIT = 20;
    private static final int AI_DOC_LIMIT = 5;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        if (!rateLimitEnabled || redisTemplate == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String requestPath = request.getRequestURI();

        if (isAuthEndpoint(requestPath)) {
            String clientIp = getClientIp(request);
            String key = "ratelimit:auth:ip:" + clientIp;
            checkRateLimit(key, AUTH_LIMIT, response, filterChain, request);
        } else if (isAiChatEndpoint(requestPath)) {
            String identifier = getUserIdentifier(request);
            String key = "ratelimit:aichat:" + identifier;
            checkRateLimit(key, AI_CHAT_LIMIT, response, filterChain, request);
        } else if (isAiDocOrExpensiveEndpoint(requestPath)) {
            String identifier = getUserIdentifier(request);
            String key = "ratelimit:aidoc:" + identifier;
            checkRateLimit(key, AI_DOC_LIMIT, response, filterChain, request);
        } else {
            filterChain.doFilter(request, response);
        }
    }

    private void checkRateLimit(
            String key,
            int limit,
            HttpServletResponse response,
            FilterChain filterChain,
            HttpServletRequest request
    ) throws ServletException, IOException {
        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count == null) {
                // If Redis fails to increment, fail-open to not block users, but log a warning.
                log.warn("Redis rate limit increment returned null for key: {}. Bypassing rate limiting.", key);
                filterChain.doFilter(request, response);
                return;
            }

            if (count == 1) {
                redisTemplate.expire(key, Duration.ofMinutes(1));
            }

            if (count <= limit) {
                response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
                response.setHeader("X-RateLimit-Remaining", String.valueOf(limit - count));
                response.setHeader("X-RateLimit-Reset", String.valueOf(System.currentTimeMillis() + 60000));
                filterChain.doFilter(request, response);
            } else {
                Long expire = redisTemplate.getExpire(key);
                long retryAfter = (expire != null && expire > 0) ? expire : 60;
                log.warn("Rate limit exceeded for key: {} on endpoint: {}", key, request.getRequestURI());
                writeRateLimitResponse(response, retryAfter, limit);
            }
        } catch (Exception e) {
            // Fail-open: if Redis connection is down, allow request but log the error
            log.error("Redis rate limiting error for key: {}. Bypassing rate limiting.", key, e);
            filterChain.doFilter(request, response);
        }
    }

    private boolean isAuthEndpoint(String path) {
        return path.matches("^/api/v1/auth/(login|register|forgot-password)$");
    }

    private boolean isAiChatEndpoint(String path) {
        return path.startsWith("/api/v1/vakil-friend/chat")
                || path.startsWith("/api/v1/brain/chat");
    }

    private boolean isAiDocOrExpensiveEndpoint(String path) {
        return path.contains("/analyze-document")
                || path.startsWith("/api/v1/documents/generate")
                || path.startsWith("/api/v1/police/fir/upload")
                || path.startsWith("/api/v1/brain/analyze-case")
                || path.startsWith("/api/v1/brain/suggest-documents");
    }

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

    private String getUserIdentifier(HttpServletRequest request) {
        if (request.getUserPrincipal() != null) {
            return "user:" + request.getUserPrincipal().getName();
        }
        return "ip:" + getClientIp(request);
    }

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

    // Package-private setter for unit testing
    void setRedisTemplate(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    void setRateLimitEnabled(boolean rateLimitEnabled) {
        this.rateLimitEnabled = rateLimitEnabled;
    }
}