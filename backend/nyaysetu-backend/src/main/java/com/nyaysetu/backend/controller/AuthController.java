package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.JwtResponse;
import com.nyaysetu.backend.dto.LoginRequest;
import com.nyaysetu.backend.dto.RegisterRequest;
import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.service.AuthService;
import com.nyaysetu.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        authService.register(
                req.getEmail(),
                req.getName(),
                req.getPassword(),
                req.getRole() != null ? req.getRole() : Role.USER // default
        );
        return ResponseEntity.ok("Registered");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
            String token = jwtService.generateToken(new HashMap<>(), userDetails);

            // Get full user details
            var user = authService.findByEmail(req.getEmail());

            // Create response with token and user info
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
            ));

            return ResponseEntity.ok(response);
        }
        catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
    }
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("ok");
    }
}