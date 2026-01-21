package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.FirRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FirRecordRepository extends JpaRepository<FirRecord, Long> {
    
    List<FirRecord> findByUploadedByIdOrderByUploadedAtDesc(Long userId);
    
    Optional<FirRecord> findByFirNumber(String firNumber);
    
    List<FirRecord> findByCaseId(UUID caseId);
    
    boolean existsByFileHash(String fileHash);
    
    Optional<FirRecord> findByFileHash(String fileHash);
}
