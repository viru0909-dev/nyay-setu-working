package com.nyaysetu.backend.handler;

import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.lang.reflect.Field;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationWebSocketHandlerTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private User user;

    @Mock
    private UserDetails userDetails;

    private NotificationWebSocketHandler handler;

    @BeforeEach
    void setUp() {
        handler = new NotificationWebSocketHandler(jwtService, userDetailsService, userRepository);
    }

    @Test
    void multipleSessionsForSameUserReceiveNotifications() throws Exception {
        WebSocketSession sessionA = mock(WebSocketSession.class);
        WebSocketSession sessionB = mock(WebSocketSession.class);

        when(sessionA.isOpen()).thenReturn(true);
        when(sessionB.isOpen()).thenReturn(true);

        authenticateSession(sessionA, "A", "token-1", 1L);
        authenticateSession(sessionB, "B", "token-1", 1L);

        clearInvocations(sessionA, sessionB);

        handler.sendNotification(1L, Map.of("message", "hello"));

        verify(sessionA, times(1)).sendMessage(any(TextMessage.class));
        verify(sessionB, times(1)).sendMessage(any(TextMessage.class));
    }

    @Test
    void disconnectingOneSessionDoesNotRemoveOtherActiveSession() throws Exception {
        WebSocketSession sessionA = mock(WebSocketSession.class);
        WebSocketSession sessionB = mock(WebSocketSession.class);

        when(sessionB.isOpen()).thenReturn(true);

        authenticateSession(sessionA, "A", "token-1", 1L);
        authenticateSession(sessionB, "B", "token-1", 1L);

        clearInvocations(sessionA, sessionB);

        handler.afterConnectionClosed(sessionA, CloseStatus.NORMAL);

        handler.sendNotification(1L, Map.of("message", "hello"));

        verify(sessionA, never()).sendMessage(any(TextMessage.class));
        verify(sessionB, times(1)).sendMessage(any(TextMessage.class));

        Map<Long, ?> sessionsByUserId = (Map<Long, ?>) getInternalField("sessionsByUserId");
        assertTrue(sessionsByUserId.containsKey(1L));
        assertTrue(sessionsByUserId.get(1L) instanceof java.util.Collection);
        assertEquals(1, ((java.util.Collection<?>) sessionsByUserId.get(1L)).size());
    }

    @Test
    void closedSessionsAreIgnoredDuringNotificationDelivery() throws Exception {
        WebSocketSession sessionA = mock(WebSocketSession.class);
        WebSocketSession sessionB = mock(WebSocketSession.class);

        when(sessionA.getId()).thenReturn("A");
        when(sessionB.getId()).thenReturn("B");
        when(sessionA.isOpen()).thenReturn(true, false);
        when(sessionB.isOpen()).thenReturn(true);

        authenticateSession(sessionA, "A", "token-1", 1L);
        authenticateSession(sessionB, "B", "token-1", 1L);

        clearInvocations(sessionA, sessionB);
        when(sessionA.isOpen()).thenReturn(false);

        handler.sendNotification(1L, Map.of("message", "hello"));

        verify(sessionA, never()).sendMessage(any(TextMessage.class));
        verify(sessionB, times(1)).sendMessage(any(TextMessage.class));
    }

    @Test
    void removingLastSessionCleansUpUserMappings() throws Exception {
        WebSocketSession session = mock(WebSocketSession.class);

        authenticateSession(session, "A", "token-1", 1L);
        clearInvocations(session);

        handler.afterConnectionClosed(session, CloseStatus.NORMAL);

        Map<Long, ?> sessionsByUserId = (Map<Long, ?>) getInternalField("sessionsByUserId");
        Map<String, Long> userIdBySessionId = (Map<String, Long>) getInternalField("userIdBySessionId");

        assertFalse(sessionsByUserId.containsKey(1L));
        assertFalse(userIdBySessionId.containsKey("A"));
    }

    @Test
    void singleSessionStillWorks() throws Exception {
        WebSocketSession session = mock(WebSocketSession.class);

        when(session.isOpen()).thenReturn(true);

        authenticateSession(session, "A", "token-1", 1L);
        clearInvocations(session);

        handler.sendNotification(1L, Map.of("message", "hello"));

        verify(session, times(1)).sendMessage(any(TextMessage.class));
    }

    private void authenticateSession(WebSocketSession session,
                                     String sessionId,
                                     String token,
                                     long userId) throws Exception {
        when(session.getId()).thenReturn(sessionId);
        when(jwtService.extractUsername(token)).thenReturn("user@example.com");
        when(userDetailsService.loadUserByUsername("user@example.com")).thenReturn(userDetails);
        when(jwtService.isTokenValid(token, userDetails)).thenReturn(true);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(user.getId()).thenReturn(userId);

        handler.afterConnectionEstablished(session);
        handler.handleTextMessage(session, new TextMessage("{\"type\":\"AUTH\",\"token\":\"" + token + "\"}"));
    }

    @SuppressWarnings("unchecked")
    private <T> T getInternalField(String fieldName) throws Exception {
        Field field = NotificationWebSocketHandler.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        return (T) field.get(handler);
    }
}
