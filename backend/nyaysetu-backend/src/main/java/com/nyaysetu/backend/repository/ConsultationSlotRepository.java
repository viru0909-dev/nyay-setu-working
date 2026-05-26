package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.ConsultationSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultationSlotRepository extends JpaRepository<ConsultationSlot, Long> {
    
    @Query("SELECT s FROM ConsultationSlot s WHERE s.lawyer.id = :lawyerId " +
           "AND s.startTime >= :from AND s.startTime <= :to " +
           "ORDER BY s.startTime ASC")
    List<ConsultationSlot> findAvailableSlotsInRange(
            @Param("lawyerId") Long lawyerId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT s FROM ConsultationSlot s WHERE s.lawyer.id = :lawyerId " +
           "AND s.status = 'AVAILABLE' AND s.startTime >= :from AND s.startTime <= :to " +
           "ORDER BY s.startTime ASC")
    List<ConsultationSlot> findAvailableSlots(
            @Param("lawyerId") Long lawyerId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(s) FROM ConsultationSlot s WHERE s.lawyer.id = :lawyerId " +
           "AND s.status = 'BOOKED' AND s.startTime BETWEEN :from AND :to")
    int countBookedSlots(
            @Param("lawyerId") Long lawyerId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
