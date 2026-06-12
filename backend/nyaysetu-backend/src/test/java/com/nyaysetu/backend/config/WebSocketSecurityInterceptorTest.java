package com.nyaysetu.backend.config;

import com.nyaysetu.backend.entity.Hearing;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.HearingParticipantRepository;
import com.nyaysetu.backend.repository.HearingRepository;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.security.Principal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebSocketSecurityInterceptorTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HearingRepository hearingRepository;

    @Mock
    private HearingParticipantRepository hearingParticipantRepository;

    @Mock
    private MessageChannel messageChannel;

    private WebSocketSecurityInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new WebSocketSecurityInterceptor(
                jwtService,
                userDetailsService,
                userRepository,
                hearingRepository,
                hearingParticipantRepository
        );
    }

    @Test
    void connectWithValidJwtSucceeds() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.addNativeHeader("Authorization", "Bearer valid-token");
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("test@example.com");
        when(userDetails.getAuthorities()).thenReturn(null);

        when(jwtService.extractUsername("valid-token")).thenReturn("test@example.com");
        when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(userDetails);
        when(jwtService.isTokenValid("valid-token", userDetails)).thenReturn(true);

        Message<?> result = interceptor.preSend(message, messageChannel);

        assertNotNull(result);
        StompHeaderAccessor resultAccessor = StompHeaderAccessor.wrap(result);
        assertNotNull(resultAccessor.getUser());
        assertEquals("test@example.com", resultAccessor.getUser().getName());
    }

    @Test
    void connectWithInvalidJwtThrowsException() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.addNativeHeader("Authorization", "Bearer invalid-token");
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        UserDetails userDetails = mock(UserDetails.class);
        when(jwtService.extractUsername("invalid-token")).thenReturn("test@example.com");
        when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(userDetails);
        when(jwtService.isTokenValid("invalid-token", userDetails)).thenReturn(false);

        assertThrows(MessageDeliveryException.class, () -> interceptor.preSend(message, messageChannel));
    }

    @Test
    void connectWithMissingHeaderThrowsException() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThrows(MessageDeliveryException.class, () -> interceptor.preSend(message, messageChannel));
    }

    @Test
    void subscribeByJudgeSucceeds() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/courtroom/room-123");
        Principal principal = new UsernamePasswordAuthenticationToken("judge@example.com", null);
        accessor.setUser(principal);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        User user = new User();
        user.setEmail("judge@example.com");
        user.setRole(Role.JUDGE);

        when(userRepository.findByEmail("judge@example.com")).thenReturn(Optional.of(user));

        Message<?> result = interceptor.preSend(message, messageChannel);
        assertNotNull(result);
    }

    @Test
    void subscribeByAssignedLitigantSucceeds() {
        UUID hearingId = UUID.randomUUID();
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/courtroom/" + hearingId);
        Principal principal = new UsernamePasswordAuthenticationToken("litigant@example.com", null);
        accessor.setUser(principal);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        User user = new User();
        user.setId(1L);
        user.setEmail("litigant@example.com");
        user.setRole(Role.LITIGANT);

        Hearing hearing = new Hearing();
        hearing.setId(hearingId);

        when(userRepository.findByEmail("litigant@example.com")).thenReturn(Optional.of(user));
        when(hearingRepository.findById(hearingId)).thenReturn(Optional.of(hearing));
        when(hearingParticipantRepository.existsByHearingIdAndUserId(hearingId, 1L)).thenReturn(true);

        Message<?> result = interceptor.preSend(message, messageChannel);
        assertNotNull(result);
    }

    @Test
    void subscribeByUnassignedLitigantThrowsException() {
        UUID hearingId = UUID.randomUUID();
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/courtroom/" + hearingId);
        Principal principal = new UsernamePasswordAuthenticationToken("litigant@example.com", null);
        accessor.setUser(principal);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        User user = new User();
        user.setId(1L);
        user.setEmail("litigant@example.com");
        user.setRole(Role.LITIGANT);

        Hearing hearing = new Hearing();
        hearing.setId(hearingId);

        when(userRepository.findByEmail("litigant@example.com")).thenReturn(Optional.of(user));
        when(hearingRepository.findById(hearingId)).thenReturn(Optional.of(hearing));
        when(hearingParticipantRepository.existsByHearingIdAndUserId(hearingId, 1L)).thenReturn(false);

        assertThrows(MessageDeliveryException.class, () -> interceptor.preSend(message, messageChannel));
    }

    @Test
    void subscribeWithVideoRoomIdSucceeds() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/courtroom/room-xyz");
        Principal principal = new UsernamePasswordAuthenticationToken("litigant@example.com", null);
        accessor.setUser(principal);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        User user = new User();
        user.setId(1L);
        user.setEmail("litigant@example.com");
        user.setRole(Role.LITIGANT);

        UUID hearingId = UUID.randomUUID();
        Hearing hearing = new Hearing();
        hearing.setId(hearingId);
        hearing.setVideoRoomId("room-xyz");

        when(userRepository.findByEmail("litigant@example.com")).thenReturn(Optional.of(user));
        when(hearingRepository.findByVideoRoomId("room-xyz")).thenReturn(Optional.of(hearing));
        when(hearingParticipantRepository.existsByHearingIdAndUserId(hearingId, 1L)).thenReturn(true);

        Message<?> result = interceptor.preSend(message, messageChannel);
        assertNotNull(result);
    }

    @Test
    void sendByAssignedLitigantSucceeds() {
        UUID hearingId = UUID.randomUUID();
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SEND);
        accessor.setDestination("/topic/courtroom/" + hearingId);
        Principal principal = new UsernamePasswordAuthenticationToken("litigant@example.com", null);
        accessor.setUser(principal);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        User user = new User();
        user.setId(1L);
        user.setEmail("litigant@example.com");
        user.setRole(Role.LITIGANT);

        Hearing hearing = new Hearing();
        hearing.setId(hearingId);

        when(userRepository.findByEmail("litigant@example.com")).thenReturn(Optional.of(user));
        when(hearingRepository.findById(hearingId)).thenReturn(Optional.of(hearing));
        when(hearingParticipantRepository.existsByHearingIdAndUserId(hearingId, 1L)).thenReturn(true);

        Message<?> result = interceptor.preSend(message, messageChannel);
        assertNotNull(result);
    }
}
