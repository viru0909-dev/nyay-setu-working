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
import org.springframework.web.util.HtmlUtils;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class XssSanitizationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        XssSanitizedRequestWrapper wrappedRequest = new XssSanitizedRequestWrapper(request);
        filterChain.doFilter(wrappedRequest, response);
    }

    private static class XssSanitizedRequestWrapper extends HttpServletRequestWrapper {

        private byte[] sanitizedBody;
        private final Map<String, String[]> sanitizedParameters;
        private final Map<String, String> sanitizedHeaders;

        public XssSanitizedRequestWrapper(HttpServletRequest request) throws IOException {
            super(request);

            this.sanitizedBody = sanitizeBody(request);
            this.sanitizedParameters = sanitizeParameters(request);
            this.sanitizedHeaders = sanitizeHeaders(request);
        }

        private byte[] sanitizeBody(HttpServletRequest request) throws IOException {
            int contentLength = request.getContentLength();
            if (contentLength == 0 || contentLength == -1) {
                return new byte[0];
            }

            String contentType = request.getContentType();
            if (contentType != null && (contentType.contains("multipart") || contentType.contains("octet-stream"))) {
                String originalBody;
                try (BufferedReader reader = request.getReader()) {
                    originalBody = reader.lines().collect(Collectors.joining(System.lineSeparator()));
                }
                return originalBody.getBytes(StandardCharsets.UTF_8);
            }

            String originalBody;
            try (BufferedReader reader = request.getReader()) {
                originalBody = reader.lines().collect(Collectors.joining(System.lineSeparator()));
            }

            if (originalBody == null || originalBody.isEmpty()) {
                return new byte[0];
            }

            String sanitized = sanitizeJsonStringValues(originalBody);
            return sanitized.getBytes(StandardCharsets.UTF_8);
        }

        private Map<String, String[]> sanitizeParameters(HttpServletRequest request) {
            Map<String, String[]> sanitized = new LinkedHashMap<>();
            Map<String, String[]> original = request.getParameterMap();

            for (Map.Entry<String, String[]> entry : original.entrySet()) {
                String[] sanitizedValues = Arrays.stream(entry.getValue())
                        .map(v -> v != null ? HtmlUtils.htmlEscape(v) : null)
                        .toArray(String[]::new);
                sanitized.put(entry.getKey(), sanitizedValues);
            }

            return sanitized;
        }

        private Map<String, String> sanitizeHeaders(HttpServletRequest request) {
            Map<String, String> sanitized = new LinkedHashMap<>();
            Enumeration<String> headerNames = request.getHeaderNames();

            if (headerNames != null) {
                while (headerNames.hasMoreElements()) {
                    String name = headerNames.nextElement();
                    String value = request.getHeader(name);
                    sanitized.put(name, value != null ? HtmlUtils.htmlEscape(value) : null);
                }
            }

            return sanitized;
        }

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
                    result.append(HtmlUtils.htmlEscape(String.valueOf(c)));
                } else {
                    result.append(c);
                }
            }

            return result.toString();
        }

        @Override
        public String getParameter(String name) {
            String[] values = sanitizedParameters.get(name);
            return values != null && values.length > 0 ? values[0] : null;
        }

        @Override
        public Map<String, String[]> getParameterMap() {
            return Collections.unmodifiableMap(sanitizedParameters);
        }

        @Override
        public String[] getParameterValues(String name) {
            return sanitizedParameters.get(name);
        }

        @Override
        public Enumeration<String> getParameterNames() {
            return Collections.enumeration(sanitizedParameters.keySet());
        }

        @Override
        public String getQueryString() {
            String query = ((HttpServletRequest) getRequest()).getQueryString();
            return query != null ? HtmlUtils.htmlEscape(query) : null;
        }

        @Override
        public String getHeader(String name) {
            return sanitizedHeaders.get(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            return Collections.enumeration(sanitizedHeaders.keySet());
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            String value = sanitizedHeaders.get(name);
            return Collections.enumeration(value != null ? Collections.singletonList(value) : Collections.emptyList());
        }

        @Override
        public int getIntHeader(String name) {
            String value = sanitizedHeaders.get(name);
            return value != null ? Integer.parseInt(value) : super.getIntHeader(name);
        }

        @Override
        public long getDateHeader(String name) {
            String value = sanitizedHeaders.get(name);
            return value != null ? super.getDateHeader(name) : -1L;
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
