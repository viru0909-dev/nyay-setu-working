package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.RefreshToken;
import com.nyaysetu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByExpiresAtBefore(LocalDateTime cutoff);
    void deleteByUser(User user);
}
