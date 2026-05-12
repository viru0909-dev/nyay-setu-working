package com.nyaysetu.backend.forensics.repository;

import com.nyaysetu.backend.forensics.entity.AccidentCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccidentCaseRepository extends JpaRepository<AccidentCase, UUID> {
    List<AccidentCase> findByUserId(Long userId);
}
