package com.nyaysetu.caseservice.repository;

import com.nyaysetu.caseservice.entity.CaseDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaseDocumentRepository extends JpaRepository<CaseDocument, Long> {
}