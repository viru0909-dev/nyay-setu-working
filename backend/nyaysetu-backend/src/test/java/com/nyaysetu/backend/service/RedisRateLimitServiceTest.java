package com.nyaysetu.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RedisRateLimitServiceTest {

    private StringRedisTemplate redisTemplate;
    private RedisRateLimitService service;

    @BeforeEach
    void setUp() {
        redisTemplate = mock(StringRedisTemplate.class);
        service = new RedisRateLimitService(redisTemplate);

        ReflectionTestUtils.setField(service, "enabled", true);
        ReflectionTestUtils.setField(service, "maxIpAttempts", 5);
        ReflectionTestUtils.setField(service, "ipWindowSeconds", 60L);
        ReflectionTestUtils.setField(service, "maxAccountAttempts", 10);
        ReflectionTestUtils.setField(service, "accountWindowSeconds", 900L);
        ReflectionTestUtils.setField(
                service,
                "keyPrefix",
                "rate-limit:auth:login"
        );
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void allowsAttemptWhenBothLimitsHaveCapacity() {
        doReturn(List.of(1L, 60L, 1L, 900L))
                .when(redisTemplate)
                .execute(
                        any(RedisScript.class),
                        anyList(),
                        any(),
                        any()
                );

        RedisRateLimitService.RateLimitResult result =
                service.consumeLoginAttempt(
                        "192.0.2.10",
                        "user@example.com"
                );

        assertTrue(result.isAllowed());
        assertEquals(5, result.getLimit());
        assertEquals(4, result.getRemaining());
        assertEquals(0, result.getRetryAfterSeconds());
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void blocksWhenIpLimitIsExceeded() {
        doReturn(List.of(6L, 37L, 2L, 800L))
                .when(redisTemplate)
                .execute(
                        any(RedisScript.class),
                        anyList(),
                        any(),
                        any()
                );

        RedisRateLimitService.RateLimitResult result =
                service.consumeLoginAttempt(
                        "192.0.2.10",
                        "user@example.com"
                );

        assertFalse(result.isAllowed());
        assertEquals(5, result.getLimit());
        assertEquals(0, result.getRemaining());
        assertEquals(37, result.getRetryAfterSeconds());
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void blocksAccountAcrossDifferentClientIps() {
        doReturn(List.of(1L, 55L, 11L, 420L))
                .when(redisTemplate)
                .execute(
                        any(RedisScript.class),
                        anyList(),
                        any(),
                        any()
                );

        RedisRateLimitService.RateLimitResult result =
                service.consumeLoginAttempt(
                        "198.51.100.25",
                        "victim@example.com"
                );

        assertFalse(result.isAllowed());
        assertEquals(10, result.getLimit());
        assertEquals(0, result.getRemaining());
        assertEquals(420, result.getRetryAfterSeconds());
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void usesPrivacySafeHashedAccountKey() {
        doReturn(List.of(1L, 60L, 1L, 900L))
                .when(redisTemplate)
                .execute(
                        any(RedisScript.class),
                        anyList(),
                        any(),
                        any()
                );

        service.consumeLoginAttempt(
                "203.0.113.5",
                "  User@Example.COM  "
        );

        ArgumentCaptor<List<String>> keysCaptor =
                ArgumentCaptor.forClass(List.class);

        verify(redisTemplate).execute(
                any(RedisScript.class),
                keysCaptor.capture(),
                any(),
                any()
        );

        List<String> keys = keysCaptor.getValue();

        assertEquals(2, keys.size());
        assertEquals(
                "rate-limit:auth:login:ip:203.0.113.5",
                keys.get(0)
        );

        assertFalse(keys.get(1).contains("User@Example.COM"));
        assertFalse(keys.get(1).contains("user@example.com"));

        assertTrue(
                keys.get(1).matches(
                        "rate-limit:auth:login:account:[a-f0-9]{64}"
                )
        );
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void normalizesEmailBeforeHashing() {
        doReturn(List.of(1L, 60L, 1L, 900L))
                .when(redisTemplate)
                .execute(
                        any(RedisScript.class),
                        anyList(),
                        any(),
                        any()
                );

        service.consumeLoginAttempt(
                "192.0.2.1",
                "User@Example.COM"
        );

        service.consumeLoginAttempt(
                "192.0.2.2",
                "  user@example.com  "
        );

        ArgumentCaptor<List<String>> keysCaptor =
                ArgumentCaptor.forClass(List.class);

        verify(redisTemplate, times(2)).execute(
                any(RedisScript.class),
                keysCaptor.capture(),
                any(),
                any()
        );

        List<List<String>> allKeys = keysCaptor.getAllValues();

        assertEquals(
                allKeys.get(0).get(1),
                allKeys.get(1).get(1)
        );
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void failsOpenWhenRedisIsUnavailable() {
        doThrow(new RuntimeException("Redis unavailable"))
                .when(redisTemplate)
                .execute(
                        any(RedisScript.class),
                        anyList(),
                        any(),
                        any()
                );

        RedisRateLimitService.RateLimitResult result =
                service.consumeLoginAttempt(
                        "192.0.2.10",
                        "user@example.com"
                );

        assertTrue(result.isAllowed());
        assertEquals(5, result.getLimit());
        assertEquals(4, result.getRemaining());
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void incompleteRedisResultFailsOpen() {
        doReturn(List.of(1L))
                .when(redisTemplate)
                .execute(
                        any(RedisScript.class),
                        anyList(),
                        any(),
                        any()
                );

        RedisRateLimitService.RateLimitResult result =
                service.consumeLoginAttempt(
                        "192.0.2.10",
                        "user@example.com"
                );

        assertTrue(result.isAllowed());
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void disabledLimiterDoesNotCallRedis() {
        ReflectionTestUtils.setField(service, "enabled", false);

        RedisRateLimitService.RateLimitResult result =
                service.consumeLoginAttempt(
                        "192.0.2.10",
                        "user@example.com"
                );

        assertTrue(result.isAllowed());

        verify(redisTemplate, never()).execute(
                any(RedisScript.class),
                anyList(),
                any(),
                any()
        );
    }
}