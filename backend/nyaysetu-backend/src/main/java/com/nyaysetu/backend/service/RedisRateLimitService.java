package com.nyaysetu.backend.service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisRateLimitService {

    @SuppressWarnings("rawtypes")
    private static final DefaultRedisScript<List> LOGIN_RATE_LIMIT_SCRIPT = createScript();

    private final StringRedisTemplate redisTemplate;

    @Value("${security.rate-limit.auth.login.enabled:true}")
    private boolean enabled;

    @Value("${security.rate-limit.auth.login.ip.max-attempts:5}")
    private int maxIpAttempts;

    @Value("${security.rate-limit.auth.login.ip.window-seconds:60}")
    private long ipWindowSeconds;

    @Value("${security.rate-limit.auth.login.account.max-attempts:10}")
    private int maxAccountAttempts;

    @Value("${security.rate-limit.auth.login.account.window-seconds:900}")
    private long accountWindowSeconds;

    @Value("${security.rate-limit.auth.login.key-prefix:rate-limit:auth:login}")
    private String keyPrefix;

    @SuppressWarnings("rawtypes")
    private static DefaultRedisScript<List> createScript() {
        DefaultRedisScript<List> script = new DefaultRedisScript<>();
        script.setResultType(List.class);
        script.setScriptText(String.join(" ",
                "local ipCount = redis.call('INCR', KEYS[1])",
                "if tonumber(ipCount) == 1 then",
                "redis.call('EXPIRE', KEYS[1], tonumber(ARGV[1]))",
                "end",
                "local ipTtl = redis.call('TTL', KEYS[1])",
                "if tonumber(ipTtl) < 0 then",
                "redis.call('EXPIRE', KEYS[1], tonumber(ARGV[1]))",
                "ipTtl = tonumber(ARGV[1])",
                "end",
                "local accountCount = redis.call('INCR', KEYS[2])",
                "if tonumber(accountCount) == 1 then",
                "redis.call('EXPIRE', KEYS[2], tonumber(ARGV[2]))",
                "end",
                "local accountTtl = redis.call('TTL', KEYS[2])",
                "if tonumber(accountTtl) < 0 then",
                "redis.call('EXPIRE', KEYS[2], tonumber(ARGV[2]))",
                "accountTtl = tonumber(ARGV[2])",
                "end",
                "return {ipCount, ipTtl, accountCount, accountTtl}"
        ));
        return script;
    }

    public RateLimitResult consumeLoginAttempt(String clientIp, String accountIdentifier) {
        int effectiveLimit = Math.min(maxIpAttempts, maxAccountAttempts);

        if (!enabled) {
            return RateLimitResult.allowed(effectiveLimit, Math.max(0, effectiveLimit - 1));
        }

        String ipKey = keyPrefix + ":ip:" + sanitizeClientIp(clientIp);
        String accountKey = keyPrefix + ":account:" + hashAccountIdentifier(accountIdentifier);

        try {
            List<?> result = redisTemplate.execute(
                    LOGIN_RATE_LIMIT_SCRIPT,
                    List.of(ipKey, accountKey),
                    String.valueOf(ipWindowSeconds),
                    String.valueOf(accountWindowSeconds)
            );

            if (result == null || result.size() < 4) {
                log.warn("Redis returned an incomplete login rate-limit result; allowing request");
                return RateLimitResult.allowed(effectiveLimit, Math.max(0, effectiveLimit - 1));
            }

            long ipCount = asLong(result.get(0));
            long ipTtl = normalizeTtl(asLong(result.get(1)), ipWindowSeconds);
            long accountCount = asLong(result.get(2));
            long accountTtl = normalizeTtl(asLong(result.get(3)), accountWindowSeconds);

            boolean ipBlocked = ipCount > maxIpAttempts;
            boolean accountBlocked = accountCount > maxAccountAttempts;

            if (!ipBlocked && !accountBlocked) {
                int ipRemaining = (int) Math.max(0, maxIpAttempts - ipCount);
                int accountRemaining = (int) Math.max(0, maxAccountAttempts - accountCount);

                return RateLimitResult.allowed(
                        effectiveLimit,
                        Math.min(ipRemaining, accountRemaining)
                );
            }

            long retryAfterSeconds = 0;
            int blockingLimit = Integer.MAX_VALUE;

            if (ipBlocked) {
                retryAfterSeconds = Math.max(retryAfterSeconds, ipTtl);
                blockingLimit = Math.min(blockingLimit, maxIpAttempts);
            }

            if (accountBlocked) {
                retryAfterSeconds = Math.max(retryAfterSeconds, accountTtl);
                blockingLimit = Math.min(blockingLimit, maxAccountAttempts);
            }

            return RateLimitResult.blocked(
                    blockingLimit,
                    Math.max(1, retryAfterSeconds)
            );
        } catch (Exception ex) {
            log.warn(
                    "Redis login rate-limit check failed; allowing authentication request",
                    ex
            );
            return RateLimitResult.allowed(effectiveLimit, Math.max(0, effectiveLimit - 1));
        }
    }

    private long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }

    private long normalizeTtl(long ttl, long configuredWindow) {
        return ttl > 0 ? ttl : configuredWindow;
    }

    private String sanitizeClientIp(String clientIp) {
        if (clientIp == null || clientIp.isBlank()) {
            return "unknown";
        }

        return clientIp.trim().replaceAll("[^a-zA-Z0-9._:-]", "_");
    }

    private String hashAccountIdentifier(String accountIdentifier) {
        String normalized = accountIdentifier == null
                ? "unknown"
                : accountIdentifier.trim().toLowerCase(Locale.ROOT);

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(normalized.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    @Getter
    public static class RateLimitResult {

        private final boolean allowed;
        private final int limit;
        private final int remaining;
        private final long retryAfterSeconds;

        public RateLimitResult(
                boolean allowed,
                int limit,
                int remaining,
                long retryAfterSeconds
        ) {
            this.allowed = allowed;
            this.limit = limit;
            this.remaining = remaining;
            this.retryAfterSeconds = retryAfterSeconds;
        }

        public static RateLimitResult allowed(int limit, int remaining) {
            return new RateLimitResult(true, limit, remaining, 0);
        }

        public static RateLimitResult blocked(int limit, long retryAfterSeconds) {
            return new RateLimitResult(false, limit, 0, retryAfterSeconds);
        }
    }
}