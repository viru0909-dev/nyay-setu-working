package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.LegalCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LegalCaseRepository extends JpaRepository<LegalCase, UUID> {
}