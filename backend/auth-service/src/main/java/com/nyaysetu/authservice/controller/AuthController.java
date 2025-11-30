package com.nyaysetu.authservice.controller;

import com.nyaysetu.authservice.dto.JwtResponse;
import com.nyaysetu.authservice.dto.LoginRequest;
import com.nyaysetu.authservice.dto.RegisterRequest;
import com.nyaysetu.authservice.entity.Role;
import com.nyaysetu.authservice.service.AuthService;
import com.nyaysetu.authservice.service.JwtService;
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

            return ResponseEntity.ok(new JwtResponse(token));
        }
        catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("ok");
    }
}