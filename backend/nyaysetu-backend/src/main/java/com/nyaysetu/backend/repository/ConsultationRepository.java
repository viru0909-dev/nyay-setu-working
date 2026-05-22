package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    
    Page<Consultation> findByClientId(Long clientId, Pageable pageable);

    Page<Consultation> findByLawyerId(Long lawyerId, Pageable pageable);

    @Query("SELECT c FROM Consultation c WHERE c.client.id = :clientId ORDER BY c.scheduledTime DESC")
    List<Consultation> findUserConsultations(@Param("clientId") Long clientId);

    @Query("SELECT c FROM Consultation c WHERE c.lawyer.id = :lawyerId AND c.status != 'CANCELLED' " +
           "ORDER BY c.scheduledTime DESC")
    List<Consultation> findLawyerConsultations(@Param("lawyerId") Long lawyerId);

    @Query("SELECT c FROM Consultation c WHERE c.lawyer.id = :lawyerId " +
           "AND c.scheduledTime BETWEEN :from AND :to " +
           "AND c.status != 'CANCELLED'")
    List<Consultation> findConflictingConsultations(
            @Param("lawyerId") Long lawyerId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(c) FROM Consultation c WHERE c.lawyer.id = :lawyerId " +
           "AND c.status = 'COMPLETED'")
    int countCompletedConsultations(@Param("lawyerId") Long lawyerId);

    @Query("SELECT COUNT(c) FROM Consultation c WHERE c.client.id = :clientId " +
           "AND c.status = 'SCHEDULED'")
    int countScheduledConsultations(@Param("clientId") Long clientId);
}
