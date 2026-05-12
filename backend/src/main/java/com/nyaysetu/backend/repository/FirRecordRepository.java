package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.FirRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FirRecordRepository extends JpaRepository<FirRecord, Long> {
    
    // Police uploaded FIRs
    List<FirRecord> findByUploadedByIdOrderByUploadedAtDesc(Long userId);
    
    // Client filed FIRs
    List<FirRecord> findByFiledByIdOrderByUploadedAtDesc(Long userId);
    
    // FIRs pending police review
    List<FirRecord> findByStatusOrderByUploadedAtDesc(String status);
    
    Optional<FirRecord> findByFirNumber(String firNumber);
    
    List<FirRecord> findByCaseId(UUID caseId);
    
    boolean existsByFileHash(String fileHash);
    
    Optional<FirRecord> findByFileHash(String fileHash);
    
    // Count by status
    long countByFiledByIdAndStatus(Long userId, String status);
}

