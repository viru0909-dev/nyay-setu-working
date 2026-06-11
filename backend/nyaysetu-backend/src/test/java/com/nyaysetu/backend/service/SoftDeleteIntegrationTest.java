package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class SoftDeleteIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void testUserSoftDelete() {
        // 1. Create and save a new user
        User user = User.builder()
                .email("testdelete@example.com")
                .name("Test Delete User")
                .password("SecurePassword123!")
                .role(Role.LITIGANT)
                .build();
        
        user = userRepository.save(user);
        assertNotNull(user.getId());
        assertNull(user.getDeletedAt());

        // Verify the user can be retrieved normally
        Optional<User> foundUser = userRepository.findById(user.getId());
        assertTrue(foundUser.isPresent());
        assertEquals("testdelete@example.com", foundUser.get().getEmail());

        // 2. Perform soft delete via userRepository.delete
        userRepository.delete(user);
        userRepository.flush(); // ensure changes are flushed to DB

        // 3. Verify user is no longer retrieved via JPA standard methods due to @Where annotation
        Optional<User> softDeletedUser = userRepository.findById(user.getId());
        assertFalse(softDeletedUser.isPresent());

        Optional<User> softDeletedUserByEmail = userRepository.findByEmail("testdelete@example.com");
        assertFalse(softDeletedUserByEmail.isPresent());

        // 4. Verify via direct JDBC query that the row still exists in the database and has deleted_at timestamp set
        Timestamp deletedAt = jdbcTemplate.queryForObject(
                "SELECT deleted_at FROM ny_user WHERE id = ?",
                Timestamp.class,
                user.getId()
        );
        assertNotNull(deletedAt);
        assertTrue(deletedAt.toLocalDateTime().isBefore(LocalDateTime.now().plusSeconds(5)));
    }
}
