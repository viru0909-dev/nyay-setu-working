package com.nyaysetu.caseservice.repository;

import com.nyaysetu.caseservice.entity.CaseComment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaseCommentRepository extends JpaRepository<CaseComment, Long> {
}