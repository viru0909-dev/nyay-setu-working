package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, UUID> {
    Optional<Meeting> findByMeetingCode(String meetingCode);

    List<Meeting> findByCaseId(UUID caseId);
}
