package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for CaseEvent audit trail entries.
 */
@Repository
public interface CaseEventRepository extends JpaRepository<CaseEvent, UUID> {

    /**
     * Get all events for a case, ordered by timestamp descending (newest first)
     */
    List<CaseEvent> findByCaseIdOrderByTimestampDesc(UUID caseId);

    /**
     * Get all events for a case, ordered by timestamp ascending (oldest first - timeline order)
     */
    List<CaseEvent> findByCaseIdOrderByTimestampAsc(UUID caseId);

    /**
     * Get events of a specific type for a case
     */
    List<CaseEvent> findByCaseIdAndEventTypeOrderByTimestampDesc(UUID caseId, String eventType);

    /**
     * Get events by actor role (e.g., all JUDGE actions)
     */
    List<CaseEvent> findByCaseIdAndActorRoleOrderByTimestampDesc(UUID caseId, String actorRole);

    /**
     * Get recent events across all cases (for admin dashboard)
     */
    List<CaseEvent> findTop50ByOrderByTimestampDesc();

    /**
     * Get events within a time range
     */
    List<CaseEvent> findByCaseIdAndTimestampBetweenOrderByTimestampAsc(
        UUID caseId, LocalDateTime start, LocalDateTime end
    );

    /**
     * Count events by type for a case (for analytics)
     */
    @Query("SELECT e.eventType, COUNT(e) FROM CaseEvent e WHERE e.caseId = :caseId GROUP BY e.eventType")
    List<Object[]> countEventsByType(@Param("caseId") UUID caseId);

    /**
     * Get the latest event for a case
     */
    CaseEvent findFirstByCaseIdOrderByTimestampDesc(UUID caseId);

    /**
     * Get status change events for a case
     */
    @Query("SELECT e FROM CaseEvent e WHERE e.caseId = :caseId AND e.eventType = 'STATUS_CHANGE' ORDER BY e.timestamp DESC")
    List<CaseEvent> findStatusChanges(@Param("caseId") UUID caseId);

    /**
     * Get all events for cases assigned to a judge
     */
    @Query("SELECT e FROM CaseEvent e WHERE e.caseId IN " +
           "(SELECT c.id FROM CaseEntity c WHERE c.judgeId = :judgeId) " +
           "ORDER BY e.timestamp DESC")
    List<CaseEvent> findEventsForJudge(@Param("judgeId") Long judgeId);
}
