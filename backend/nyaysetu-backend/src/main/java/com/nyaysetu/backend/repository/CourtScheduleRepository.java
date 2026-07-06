package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CourtSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CourtScheduleRepository extends JpaRepository<CourtSchedule, UUID> {

    List<CourtSchedule> findByCaseEntityId(UUID caseId);

    @Query("SELECT cs FROM CourtSchedule cs WHERE cs.courtroom.id = :courtroomId AND cs.status <> 'CANCELLED' AND cs.startTime < :endTime AND cs.endTime > :startTime")
    List<CourtSchedule> findOverlappingCourtroomSchedules(
            @Param("courtroomId") Integer courtroomId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT cs FROM CourtSchedule cs WHERE cs.judge.id = :judgeId AND cs.status <> 'CANCELLED' AND cs.startTime < :endTime AND cs.endTime > :startTime")
    List<CourtSchedule> findOverlappingJudgeSchedules(
            @Param("judgeId") Long judgeId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT cs FROM CourtSchedule cs WHERE cs.lawyer.id = :lawyerId AND cs.status <> 'CANCELLED' AND cs.startTime < :endTime AND cs.endTime > :startTime")
    List<CourtSchedule> findOverlappingLawyerSchedules(
            @Param("lawyerId") Long lawyerId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT cs FROM CourtSchedule cs WHERE cs.caseEntity.id = :caseId AND cs.status <> 'CANCELLED' AND cs.startTime < :endTime AND cs.endTime > :startTime")
    List<CourtSchedule> findOverlappingCaseSchedules(
            @Param("caseId") UUID caseId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}
