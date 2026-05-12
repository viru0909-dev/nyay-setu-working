package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaseDocumentRepository extends JpaRepository<CaseDocument, Long> {
}