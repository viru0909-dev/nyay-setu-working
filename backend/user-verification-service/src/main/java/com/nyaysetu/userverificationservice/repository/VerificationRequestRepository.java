package com.nyaysetu.userverificationservice.repository;

import com.nyaysetu.userverificationservice.entity.VerificationRequest;
import com.nyaysetu.userverificationservice.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, UUID> {
    List<VerificationRequest> findByStatus(VerificationStatus status);
}
