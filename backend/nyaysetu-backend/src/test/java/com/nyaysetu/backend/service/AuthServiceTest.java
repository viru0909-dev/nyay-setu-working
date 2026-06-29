package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

class AuthServiceTest {

    private AuthService authService;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);

        authService = new AuthService(userRepository, passwordEncoder);
    }

    @Test
    void loadByUsername_shouldReturnUserDetails() {
        User user = new User();
        user.setEmail("alice@example.com");
        user.setPassword("encodedPassword");
        user.setRole(Role.LITIGANT);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

        UserDetails userResult = authService.loadUserByUsername("alice@example.com");

        assertEquals("alice@example.com", userResult.getUsername());
        assertEquals("encodedPassword", userResult.getPassword());
    }

    @Test
    void loadByUsername_shouldReturnException_whenUserNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> authService.loadUserByUsername("unknown@example.com"));
    }

    @Test
    void register_shouldEncodePasswordAndSaveUser() {
        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");

        authService.register(
                "alice@example.com",
                "Alice",
                "plainPassword",
                Role.LITIGANT
        );

        // Verify if the user is saved with an encoded password
        verify(userRepository).save(argThat(savedUser ->
                savedUser.getEmail().equals("alice@example.com") &&
                savedUser.getName().equals("Alice") &&
                savedUser.getPassword().equals("encodedPassword") &&
                savedUser.getRole().equals(Role.LITIGANT)
        ));
    }

    @Test
    void findByEmail_shouldReturnUser() {
        User user = new User();
        user.setEmail("alice@example.com");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

        User userResult = authService.findByEmail("alice@example.com");

        assertEquals("alice@example.com", userResult.getEmail());
    }

    @Test
    void findByEmail_shouldReturnException_whenUserNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> authService.findByEmail("unknown@example.com"));
    }

    @Test
    void updateUser_shouldSaveUser() {
        User user = new User();
        user.setEmail("alice@example.com");

        authService.updateUser(user);

        // Verify if the user is saved.
        verify(userRepository).save(user);
    }
}