package com.nyaysetu.caseservice.repository;

import com.nyaysetu.caseservice.entity.LegalCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LegalCaseRepository extends JpaRepository<LegalCase, UUID> {
}