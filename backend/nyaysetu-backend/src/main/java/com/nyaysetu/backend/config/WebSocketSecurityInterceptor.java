package com.nyaysetu.backend.config;

import com.nyaysetu.backend.entity.Hearing;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.HearingParticipantRepository;
import com.nyaysetu.backend.repository.HearingRepository;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketSecurityInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final HearingRepository hearingRepository;
    private final HearingParticipantRepository hearingParticipantRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();
        if (StompCommand.CONNECT.equals(command)) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            log.debug("STOMP CONNECT header received: {}", authHeader);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String jwt = authHeader.substring(7);
                try {
                    String username = jwtService.extractUsername(jwt);
                    if (username != null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        if (jwtService.isTokenValid(jwt, userDetails)) {
                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                            accessor.setUser(authentication);
                            log.info("STOMP connection authenticated for user: {}", username);
                        } else {
                            log.warn("STOMP connection failed: Invalid JWT token");
                            throw new MessageDeliveryException("Invalid JWT token");
                        }
                    }
                } catch (Exception e) {
                    log.error("STOMP connection error: {}", e.getMessage());
                    throw new MessageDeliveryException("Authentication failed: " + e.getMessage());
                }
            } else {
                log.warn("STOMP connection rejected: Missing or invalid Authorization header");
                throw new MessageDeliveryException("Missing or invalid Authorization header");
            }
        } else if (StompCommand.SUBSCRIBE.equals(command) || StompCommand.SEND.equals(command)) {
            String destination = accessor.getDestination();
            if (destination != null) {
                log.debug("STOMP {} destination: {}", command, destination);
                // Destination matches /topic/courtroom/{roomId} or /topic/hearing/{roomId}
                if (destination.startsWith("/topic/courtroom/") || destination.startsWith("/topic/hearing/")) {
                    Principal principal = accessor.getUser();
                    if (principal == null) {
                        log.warn("STOMP {} rejected: Unauthenticated user destination {}", command, destination);
                        throw new MessageDeliveryException("Access denied: Unauthenticated");
                    }

                    String roomId = destination.substring(destination.lastIndexOf('/') + 1);
                    String username = principal.getName();
                    log.info("Checking {} authorization for user {} to room {}", command, username, roomId);

                    // Fetch user from DB to verify role
                    User user = userRepository.findByEmail(username)
                            .orElseThrow(() -> new MessageDeliveryException("User not found: " + username));

                    Role userRole = user.getRole();
                    // Judge, lawyer, admins can access any courtroom/hearing signaling topic
                    if (userRole == Role.JUDGE || userRole == Role.LAWYER || userRole == Role.ADMIN 
                            || userRole == Role.SUPER_JUDGE || userRole == Role.TECH_ADMIN) {
                        log.info("User {} with role {} authorized for destination {}", username, userRole, destination);
                    } else {
                        // For other roles (like LITIGANT), they must be assigned/invited to this specific hearing room
                        Optional<Hearing> hearingOpt = findHearingByIdOrVideoRoomId(roomId);
                        if (hearingOpt.isEmpty()) {
                            log.warn("STOMP {} rejected: Hearing room {} not found", command, roomId);
                            throw new MessageDeliveryException("Access denied: Hearing room not found");
                        }

                        Hearing hearing = hearingOpt.get();
                        boolean isParticipant = hearingParticipantRepository.existsByHearingIdAndUserId(hearing.getId(), user.getId());
                        if (!isParticipant) {
                            log.warn("STOMP {} rejected: User {} is not assigned/invited to hearing {}", command, username, hearing.getId());
                            throw new MessageDeliveryException("Access denied: Not a participant in this hearing");
                        }
                        log.info("User {} (LITIGANT) authorized for destination {}", username, destination);
                    }
                }
            }
        }

        return message;
    }

    private Optional<Hearing> findHearingByIdOrVideoRoomId(String roomId) {
        try {
            // First check if it's a valid UUID
            UUID uuid = UUID.fromString(roomId);
            Optional<Hearing> hearing = hearingRepository.findById(uuid);
            if (hearing.isPresent()) {
                return hearing;
            }
        } catch (IllegalArgumentException e) {
            // Not a valid UUID, so check by videoRoomId
        }
        return hearingRepository.findByVideoRoomId(roomId);
    }
}
