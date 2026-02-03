package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.VakilAiDiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VakilAiDiaryEntryRepository extends JpaRepository<VakilAiDiaryEntry, UUID> {

    List<VakilAiDiaryEntry> findByCaseIdOrderByCreatedAtDesc(UUID caseId);

    List<VakilAiDiaryEntry> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);

    List<VakilAiDiaryEntry> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<VakilAiDiaryEntry> findByCaseIdAndEntryTypeOrderByCreatedAtDesc(UUID caseId, String entryType);
}
