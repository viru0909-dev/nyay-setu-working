package com.nyaysetu.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nyaysetu.backend.entity.CaseMessage;

public interface CaseMessageRepository extends JpaRepository<CaseMessage, UUID> {

    List<CaseMessage> findByCaseEntityIdOrderByTimestampAsc(UUID CaseEntityId);
}