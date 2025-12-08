package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.FaceData;
import com.nyaysetu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FaceDataRepository extends JpaRepository<FaceData, Long> {
    
    Optional<FaceData> findByUser(User user);
    
    Optional<FaceData> findByUserEmail(String email);
    
    boolean existsByUser(User user);
    
    void deleteByUser(User user);
}
