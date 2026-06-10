package com.nyaysetu.backend.filter;

import com.nyaysetu.backend.service.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtAuthFilterTest {

    private JwtService jwtService;
    private JwtAuthFilter filter;
    private final String secret = "0123456789ABCDEF0123456789ABCDEF";

    @BeforeEach
    void setup() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", secret);
        UserDetailsService uds = Mockito.mock(UserDetailsService.class);
        filter = new JwtAuthFilter(jwtService, uds);
    }

    @Test
    void malformedToken_shouldReturn401WithJsonMessage() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setServletPath("/api/v1/protected");
        req.addHeader("Authorization", "Bearer this.is.not.valid");
        MockHttpServletResponse resp = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, resp, chain);

        assertEquals(401, resp.getStatus());
        String body = resp.getContentAsString();
        assertTrue(body.contains("Unauthorized"));
        assertTrue(body.contains("Access token is expired or invalid"));
    }

    @Test
    void expiredToken_shouldReturn401WithJsonMessage() throws Exception {
        // create expired token signed with the same secret
        Key key = Keys.hmacShaKeyFor(secret.getBytes());
        String expired = Jwts.builder()
                .setSubject("user@example.com")
                .setIssuedAt(new Date(System.currentTimeMillis() - 10_000))
                .setExpiration(new Date(System.currentTimeMillis() - 1_000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setServletPath("/api/v1/protected");
        req.addHeader("Authorization", "Bearer " + expired);
        MockHttpServletResponse resp = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, resp, chain);

        assertEquals(401, resp.getStatus());
        String body = resp.getContentAsString();
        assertTrue(body.contains("Unauthorized"));
        assertTrue(body.contains("Access token is expired or invalid"));
    }
}
