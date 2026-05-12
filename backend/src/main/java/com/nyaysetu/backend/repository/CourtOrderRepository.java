package com.nyaysetu.backend.repository;

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
}
