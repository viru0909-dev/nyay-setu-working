package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CaseRepository extends JpaRepository<CaseEntity, UUID> {
    List<CaseEntity> findByJudgeId(UUID judgeId);
    List<CaseEntity> findByClient(User client);
}
