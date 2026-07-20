package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.ChatSession;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.service.VakilFriendService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Chat Persistence", description = "Endpoints for retrieving and persisting AI chat messages across user sessions")
@RestController
@RequestMapping({"/chat", "/api/chat"})
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final VakilFriendService vakilFriendService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    @Operation(summary = "Get chat history", description = "Retrieve conversation history for current active session")
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, String>>> getHistory(Authentication auth) {
        User user = getCurrentUser(auth);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        List<Map<String, String>> history = vakilFriendService.getLatestSessionHistory(user);
        return ResponseEntity.ok(history);
    }

    @Operation(summary = "Persist chat message", description = "Save a message to the active chat session")
    @PostMapping("/messages")
    public ResponseEntity<Map<String, Object>> saveMessage(
            @RequestBody Map<String, String> payload,
            Authentication auth
    ) {
        User user = getCurrentUser(auth);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        String message = payload.get("message");
        String role = payload.getOrDefault("role", "user");
        ChatSession session = vakilFriendService.saveChatMessage(user, role, message);
        return ResponseEntity.ok(Map.of(
            "sessionId", session.getId(),
            "status", "SAVED"
        ));
    }
}
