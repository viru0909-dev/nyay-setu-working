package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.HearingReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface HearingReminderRepository extends JpaRepository<HearingReminder, Long> {
    List<HearingReminder> findByUserIdOrderByReminderTimeAsc(Long userId);
    List<HearingReminder> findByHearingIdAndUserId(UUID hearingId, Long userId);
}