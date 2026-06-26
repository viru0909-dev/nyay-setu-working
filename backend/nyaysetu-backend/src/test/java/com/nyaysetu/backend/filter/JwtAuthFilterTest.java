package com.nyaysetu.backend.filter;

import com.nyaysetu.backend.service.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtAuthFilterTest {

    private JwtService jwtService;
    private UserDetailsService userDetailsService;
    private JwtAuthFilter filter;
    private static final String TEST_SECRET_KEY = "0123456789ABCDEF0123456789ABCDEF";

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET_KEY);

        userDetailsService = Mockito.mock(UserDetailsService.class);
        filter = new JwtAuthFilter(jwtService, userDetailsService);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldNotFilter_authEndpoints() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/v1/auth/");

        assertTrue(filter.shouldNotFilter(request));
    }

    @Test
    void shouldNotFilter_healthEndpoint() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/v1/health");

        assertTrue(filter.shouldNotFilter(request));
    }

    @Test
    void requestWithoutAuthorizationHeader_shouldContinueFilterChain() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/v1/protected");

        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());

        assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    }

    @Test
    void malformedToken_shouldReturn401WithJsonMessage() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/v1/protected");
        request.addHeader("Authorization", "Bearer this.is.not.valid");

        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());

        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, response.getStatus());
        String responseBody = response.getContentAsString();

        assertTrue(responseBody.contains("Unauthorized"));
        assertTrue(responseBody.contains("Access token is expired or invalid"));
    }

    @Test
    void expiredToken_shouldReturn401WithJsonMessage() throws Exception {
        // create expired token signed with the same secret
        Key key = Keys.hmacShaKeyFor(TEST_SECRET_KEY.getBytes());
        String expiredToken = Jwts.builder()
                .setSubject("user@example.com")
                .setIssuedAt(new Date(System.currentTimeMillis() - 10_000))
                .setExpiration(new Date(System.currentTimeMillis() - 1_000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/v1/protected");
        request.addHeader("Authorization", "Bearer " + expiredToken);

        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());

        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, response.getStatus());
        String responseBody = response.getContentAsString();

        assertTrue(responseBody.contains("Unauthorized"));
        assertTrue(responseBody.contains("Access token is expired or invalid"));
    }

    @Test
    void validToken_shouldAuthenticateUser() throws Exception {
        UserDetails user = User.withUsername("alice@example.com").password("pw").roles("USER").build();

        Mockito.when(userDetailsService.loadUserByUsername("alice@example.com")).thenReturn(user);
        filter = new JwtAuthFilter(jwtService, userDetailsService);

        String validToken = jwtService.generateToken(Map.of(), user);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/v1/protected");
        request.addHeader("Authorization", "Bearer " + validToken);

        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());

        // Verify the user is now authenticated in the SecurityContext();
        assertEquals(HttpServletResponse.SC_OK, response.getStatus());
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("alice@example.com", SecurityContextHolder.getContext().getAuthentication().getName());
    }
}
