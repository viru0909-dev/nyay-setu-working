package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseComment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaseCommentRepository extends JpaRepository<CaseComment, Long> {
}