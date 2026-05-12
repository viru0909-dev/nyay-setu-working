package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.VerificationRequest;
import com.nyaysetu.backend.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, UUID> {
    List<VerificationRequest> findByStatus(VerificationStatus status);
}
