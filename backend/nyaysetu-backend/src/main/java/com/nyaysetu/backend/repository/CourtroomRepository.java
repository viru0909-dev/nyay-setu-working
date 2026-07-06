package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.Courtroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourtroomRepository extends JpaRepository<Courtroom, Integer> {
    Optional<Courtroom> findByRoomNumber(String roomNumber);
    List<Courtroom> findByStatus(String status);
}
