package com.nyaysetu.backend.filter;

import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.mockito.Mockito.*;

class RateLimitFilterTest {

    private RateLimitFilter filter;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;
    private StringWriter responseWriter;

    @BeforeEach
    void setUp() throws Exception {
        filter = new RateLimitFilter();
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
        when(request.getRequestURI()).thenReturn("/api/vakil-friend/chat");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(request.getUserPrincipal()).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    void authEndpoint_shouldAllowRequestsUnderLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/v1/auth/login");
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    void authEndpoint_shouldBlock_whenLimitExceeded() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/v1/auth/login");
        when(request.getRemoteAddr()).thenReturn("10.0.0.1");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);

        // Send 5 requests (the limit)
        for (int i = 0; i < 5; i++) {
            when(response.getWriter()).thenReturn(new PrintWriter(new StringWriter()));
            filter.doFilterInternal(request, response, filterChain);
        }

        // 6th request should be blocked
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));
        filter.doFilterInternal(request, response, filterChain);

        verify(response, atLeastOnce()).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
    }
}