package com.nyaysetu.backend.repository;

import java.util.Optional;
import com.nyaysetu.backend.entity.CourtOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourtOrderRepository extends JpaRepository<CourtOrder, UUID> {
    List<CourtOrder> findByCaseId(UUID caseId);
    List<CourtOrder> findByIssuedBy(String judgeName);
    List<CourtOrder> findByCaseIdAndStatus(UUID caseId, String status);
    List<CourtOrder> findByCaseIdOrderByCreatedAtDesc(UUID caseId);

    List<CourtOrder> findByVerdictType(String verdictType);

    List<CourtOrder> findByArchived(Boolean archived);

    List<CourtOrder> findByCaseIdAndArchived(UUID caseId, Boolean archived);

    Optional<CourtOrder> findFirstByCaseIdOrderByCreatedAtDesc(UUID caseId);
}
