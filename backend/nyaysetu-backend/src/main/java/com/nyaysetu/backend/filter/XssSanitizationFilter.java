package com.nyaysetu.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * XSS Sanitization Filter.
 *
 * Intercepts incoming HTTP requests and sanitizes the JSON request body
 * by escaping HTML special characters. This provides a global defense
 * layer against XSS and HTML injection attacks for all backend controllers.
 *
 * Only processes requests with JSON content type to avoid breaking
 * file uploads and other binary content.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class XssSanitizationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String contentType = request.getContentType();

        // Only sanitize JSON request bodies
        if (contentType != null && contentType.contains("application/json")) {
            XssSanitizedRequestWrapper wrappedRequest = new XssSanitizedRequestWrapper(request);
            filterChain.doFilter(wrappedRequest, response);
        } else {
            filterChain.doFilter(request, response);
        }
    }

    /**
     * Wrapper that reads the original request body, sanitizes HTML entities
     * within JSON string values, and provides the sanitized body to
     * downstream filters and controllers.
     */
    private static class XssSanitizedRequestWrapper extends HttpServletRequestWrapper {

        private final byte[] sanitizedBody;

        public XssSanitizedRequestWrapper(HttpServletRequest request) throws IOException {
            super(request);

            // Read the original body
            String originalBody;
            try (BufferedReader reader = request.getReader()) {
                originalBody = reader.lines().collect(Collectors.joining(System.lineSeparator()));
            }

            // Sanitize HTML within JSON string values
            String sanitized = sanitizeJsonStringValues(originalBody);
            this.sanitizedBody = sanitized.getBytes(StandardCharsets.UTF_8);
        }

        /**
         * Sanitize HTML special characters within JSON string values.
         *
         * This uses a simple approach: find JSON string values (content between
         * quotes after a colon) and escape HTML entities within them.
         * This preserves JSON structure while neutralizing XSS payloads.
         */
        private String sanitizeJsonStringValues(String json) {
            if (json == null || json.isEmpty()) {
                return json;
            }

            StringBuilder result = new StringBuilder();
            boolean inString = false;
            boolean escaped = false;

            for (int i = 0; i < json.length(); i++) {
                char c = json.charAt(i);

                if (escaped) {
                    result.append(c);
                    escaped = false;
                    continue;
                }

                if (c == '\\' && inString) {
                    result.append(c);
                    escaped = true;
                    continue;
                }

                if (c == '"') {
                    result.append(c);
                    inString = !inString;
                    continue;
                }

                if (inString) {
                    // Escape HTML special characters within string values
                    switch (c) {
                        case '<' -> result.append("&lt;");
                        case '>' -> result.append("&gt;");
                        default -> result.append(c);
                    }
                } else {
                    result.append(c);
                }
            }

            return result.toString();
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(sanitizedBody);
            return new ServletInputStream() {
                @Override
                public boolean isFinished() {
                    return byteArrayInputStream.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(ReadListener readListener) {
                    // Not needed for synchronous processing
                }

                @Override
                public int read() {
                    return byteArrayInputStream.read();
                }
            };
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(
                    new ByteArrayInputStream(sanitizedBody), StandardCharsets.UTF_8));
        }

        @Override
        public int getContentLength() {
            return sanitizedBody.length;
        }

        @Override
        public long getContentLengthLong() {
            return sanitizedBody.length;
        }
    }
}
