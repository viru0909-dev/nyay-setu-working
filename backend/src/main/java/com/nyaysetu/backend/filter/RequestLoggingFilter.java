package com.nyaysetu.backend.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        String method = request.getMethod();
        String remoteAddr = request.getRemoteAddr();
        String contentType = request.getContentType();
        String authHeader = request.getHeader("Authorization");

        logger.info(">>> INCOMING REQUEST: {} {} from {} | Content-Type: {} | Auth: {}", 
            method, path, remoteAddr, contentType, (authHeader != null ? "PRESENT" : "NULL"));

        try {
            filterChain.doFilter(request, response);
        } finally {
            logger.info("<<< RESPONSE: {} {} -> Status: {}", method, path, response.getStatus());
        }
    }
}
