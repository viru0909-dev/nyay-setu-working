package com.nyaysetu.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpStatus;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.Duration;

import static org.mockito.Mockito.*;

class RateLimitFilterTest {

    private RateLimitFilter filter;
    private StringRedisTemplate redisTemplate;
    private ValueOperations<String, String> valueOperations;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;
    private StringWriter responseWriter;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() throws Exception {
        filter = new RateLimitFilter();
        redisTemplate = mock(StringRedisTemplate.class);
        valueOperations = mock(ValueOperations.class);
        
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        filter.setRedisTemplate(redisTemplate);
        filter.setRateLimitEnabled(true);

        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        filterChain = mock(FilterChain.class);
        responseWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));
    }

    @Test
    void nonRateLimitedEndpoint_shouldPassThrough() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/v1/cases");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        verify(response, never()).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
    }

    @Test
    void aiChatEndpoint_shouldAllowRequestsUnderLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/v1/vakil-friend/chat");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(request.getUserPrincipal()).thenReturn(null);

        // Redis returns 1
        when(valueOperations.increment(anyString())).thenReturn(1L);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        verify(redisTemplate, times(1)).expire(anyString(), any(Duration.class));
    }

    @Test
    void authEndpoint_shouldAllowRequestsUnderLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/v1/auth/login");
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);

        when(valueOperations.increment(anyString())).thenReturn(1L);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    void authEndpoint_shouldBlock_whenLimitExceeded() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/v1/auth/login");
        when(request.getRemoteAddr()).thenReturn("10.0.0.1");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);

        // Redis returns 6 (limit is 5)
        when(valueOperations.increment(anyString())).thenReturn(6L);
        when(redisTemplate.getExpire(anyString())).thenReturn(30L);

        filter.doFilterInternal(request, response, filterChain);

        verify(response, atLeastOnce()).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        verify(filterChain, never()).doFilter(request, response);
    }
}