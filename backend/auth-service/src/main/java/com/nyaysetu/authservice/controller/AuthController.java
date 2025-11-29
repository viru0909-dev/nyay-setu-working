package com.nyaysetu.authservice.controller;

import com.nyaysetu.authservice.dto.JwtResponse;
import com.nyaysetu.authservice.dto.LoginRequest;
import com.nyaysetu.authservice.dto.RegisterRequest;
import com.nyaysetu.authservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@Valid @RequestBody RegisterRequest request) {
        JwtResponse resp = authService.register(request);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse resp = authService.login(request);
        return ResponseEntity.ok(resp);
    }
}