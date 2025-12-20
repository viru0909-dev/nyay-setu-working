package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.Hearing;
import com.nyaysetu.backend.entity.HearingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface HearingRepository extends JpaRepository<Hearing, UUID> {
    
    @Query("SELECT h FROM Hearing h WHERE h.caseEntity.id = :caseId")
    List<Hearing> findByCaseEntityId(@Param("caseId") UUID caseId);
    
    List<Hearing> findByStatus(HearingStatus status);
    
    List<Hearing> findByScheduledDateBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT h FROM Hearing h WHERE h.caseEntity.id = :caseId AND h.status = :status")
    List<Hearing> findByCaseEntityIdAndStatus(@Param("caseId") UUID caseId, @Param("status") HearingStatus status);

    List<Hearing> findByCaseEntityInOrderByScheduledDateDesc(List<CaseEntity> cases);
}