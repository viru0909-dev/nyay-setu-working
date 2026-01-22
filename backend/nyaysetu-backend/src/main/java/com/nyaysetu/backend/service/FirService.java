package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.ClientFirRequest;
import com.nyaysetu.backend.dto.FirUploadRequest;
import com.nyaysetu.backend.dto.FirUploadResponse;
import com.nyaysetu.backend.entity.FirRecord;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.FirRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirService {

    private final FirRecordRepository firRecordRepository;
    private final BlockchainService blockchainService;

    @Value("${app.upload.fir-path:uploads/fir}")
    private String firUploadPath;

    /**
     * Upload FIR document, calculate SHA-256 hash, and store record
     */
    public FirUploadResponse uploadFir(MultipartFile file, FirUploadRequest request, User uploadedBy) {
        try {
            // Create upload directory if not exists
            Path uploadDir = Paths.get(firUploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadDir.resolve(uniqueFilename);

            // Save file to disk
            file.transferTo(filePath.toFile());

            // Calculate SHA-256 hash of the file
            String fileHash = blockchainService.calculateFileHash(filePath.toFile());
            log.info("FIR Digital Fingerprint (SHA-256): {}", fileHash);

            // Generate unique FIR number
            String firNumber = generateFirNumber();

            // Create FIR record
            FirRecord firRecord = FirRecord.builder()
                    .firNumber(firNumber)
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .fileHash(fileHash)
                    .filePath(filePath.toString())
                    .fileName(originalFilename)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .uploadedBy(uploadedBy)
                    .uploadedAt(LocalDateTime.now())
                    .caseId(request.getCaseId())
                    .status(request.getCaseId() != null ? "LINKED_TO_CASE" : "SEALED")
                    .build();

            FirRecord saved = firRecordRepository.save(firRecord);
            log.info("FIR {} sealed with hash {} by officer {}", firNumber, fileHash.substring(0, 16) + "...", uploadedBy.getName());

            return mapToResponse(saved);

        } catch (IOException e) {
            log.error("Failed to upload FIR", e);
            throw new RuntimeException("Failed to upload FIR: " + e.getMessage(), e);
        }
    }

    /**
     * Get all FIRs uploaded by a specific officer
     */
    public List<FirUploadResponse> getFirsByUploader(Long userId) {
        return firRecordRepository.findByUploadedByIdOrderByUploadedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get FIR by ID
     */
    public FirUploadResponse getFirById(Long id) {
        FirRecord fir = firRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FIR not found with ID: " + id));
        return mapToResponse(fir);
    }

    /**
     * Verify FIR integrity by re-hashing the file
     */
    public FirUploadResponse verifyFirIntegrity(Long firId, MultipartFile file) {
        FirRecord fir = firRecordRepository.findById(firId)
                .orElseThrow(() -> new RuntimeException("FIR not found with ID: " + firId));

        try {
            // Save temp file
            Path tempFile = Files.createTempFile("fir-verify-", ".tmp");
            file.transferTo(tempFile.toFile());

            // Calculate hash of uploaded file
            String currentHash = blockchainService.calculateFileHash(tempFile.toFile());

            // Clean up temp file
            Files.deleteIfExists(tempFile);

            // Compare hashes
            boolean isVerified = fir.getFileHash().equals(currentHash);
            
            FirUploadResponse response = mapToResponse(fir);
            response.setVerified(isVerified);

            if (isVerified) {
                log.info("FIR {} integrity VERIFIED - Hash matches", fir.getFirNumber());
            } else {
                log.warn("FIR {} integrity FAILED - Hash mismatch! Stored: {}, Current: {}", 
                        fir.getFirNumber(), fir.getFileHash().substring(0, 16), currentHash.substring(0, 16));
            }

            return response;

        } catch (IOException e) {
            log.error("Failed to verify FIR integrity", e);
            throw new RuntimeException("Verification failed: " + e.getMessage(), e);
        }
    }

    /**
     * Get statistics for police dashboard
     */
    public FirStatsResponse getStats(Long userId) {
        List<FirRecord> userFirs = firRecordRepository.findByUploadedByIdOrderByUploadedAtDesc(userId);
        
        long total = userFirs.size();
        long sealed = userFirs.stream().filter(f -> "SEALED".equals(f.getStatus())).count();
        long linked = userFirs.stream().filter(f -> "LINKED_TO_CASE".equals(f.getStatus())).count();
        
        // Count FIRs uploaded today
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long todayCount = userFirs.stream()
                .filter(f -> f.getUploadedAt().isAfter(todayStart))
                .count();

        return FirStatsResponse.builder()
                .totalFirs(total)
                .sealedFirs(sealed)
                .linkedFirs(linked)
                .firsToday(todayCount)
                .build();
    }

    // ==================== CLIENT FIR METHODS ====================

    /**
     * Client files an FIR (with optional evidence file)
     */
    public FirUploadResponse fileClientFir(ClientFirRequest request, MultipartFile file, User filedBy) {
        try {
            String fileHash = null;
            String filePath = null;
            String fileName = null;
            String fileType = null;
            Long fileSize = null;

            // Handle optional file upload
            if (file != null && !file.isEmpty()) {
                Path uploadDir = Paths.get(firUploadPath);
                if (!Files.exists(uploadDir)) {
                    Files.createDirectories(uploadDir);
                }

                String originalFilename = file.getOriginalFilename();
                String extension = originalFilename != null && originalFilename.contains(".") 
                    ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                    : "";
                String uniqueFilename = UUID.randomUUID().toString() + extension;
                Path savedPath = uploadDir.resolve(uniqueFilename);
                file.transferTo(savedPath.toFile());

                fileHash = blockchainService.calculateFileHash(savedPath.toFile());
                filePath = savedPath.toString();
                fileName = originalFilename;
                fileType = file.getContentType();
                fileSize = file.getSize();
                log.info("Client FIR evidence hashed: {}", fileHash.substring(0, 16) + "...");
            }

            String firNumber = generateFirNumber();

            FirRecord firRecord = FirRecord.builder()
                    .firNumber(firNumber)
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .incidentDate(request.getIncidentDate())
                    .incidentLocation(request.getIncidentLocation())
                    .aiGenerated(request.getAiGenerated() != null ? request.getAiGenerated() : false)
                    .aiSessionId(request.getAiSessionId())
                    .fileHash(fileHash)
                    .filePath(filePath)
                    .fileName(fileName)
                    .fileType(fileType)
                    .fileSize(fileSize)
                    .filedBy(filedBy)
                    .uploadedAt(LocalDateTime.now())
                    .caseId(request.getCaseId())
                    .status("PENDING_POLICE_REVIEW")
                    .build();

            FirRecord saved = firRecordRepository.save(firRecord);
            log.info("Client FIR {} filed by {} - Status: PENDING_POLICE_REVIEW", firNumber, filedBy.getName());

            return mapToResponse(saved);

        } catch (IOException e) {
            log.error("Failed to file client FIR", e);
            throw new RuntimeException("Failed to file FIR: " + e.getMessage(), e);
        }
    }

    /**
     * Get all FIRs filed by a specific client
     */
    public List<FirUploadResponse> getClientFirs(Long userId) {
        return firRecordRepository.findByFiledByIdOrderByUploadedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all FIRs pending police review
     */
    public List<FirUploadResponse> getPendingReviewFirs() {
        return firRecordRepository.findByStatusOrderByUploadedAtDesc("PENDING_POLICE_REVIEW")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Police updates FIR status (REGISTERED or REJECTED)
     */
    public FirUploadResponse updateFirStatus(Long firId, String status, String reviewNotes, User reviewedBy) {
        FirRecord fir = firRecordRepository.findById(firId)
                .orElseThrow(() -> new RuntimeException("FIR not found with ID: " + firId));

        fir.setStatus(status);
        fir.setReviewNotes(reviewNotes);
        fir.setReviewedAt(LocalDateTime.now());
        fir.setReviewedBy(reviewedBy);

        FirRecord saved = firRecordRepository.save(fir);
        log.info("FIR {} status updated to {} by {}", fir.getFirNumber(), status, reviewedBy.getName());

        return mapToResponse(saved);
    }

    /**
     * Get client FIR stats for dashboard
     */
    public ClientFirStatsResponse getClientStats(Long userId) {
        long pending = firRecordRepository.countByFiledByIdAndStatus(userId, "PENDING_POLICE_REVIEW");
        long registered = firRecordRepository.countByFiledByIdAndStatus(userId, "REGISTERED");
        long rejected = firRecordRepository.countByFiledByIdAndStatus(userId, "REJECTED");
        long total = pending + registered + rejected;

        return ClientFirStatsResponse.builder()
                .totalFirs(total)
                .pendingFirs(pending)
                .registeredFirs(registered)
                .rejectedFirs(rejected)
                .build();
    }

    private String generateFirNumber() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = String.format("%06d", (int) (Math.random() * 1000000));
        return "FIR-" + datePrefix + "-" + randomSuffix;
    }

    private FirUploadResponse mapToResponse(FirRecord fir) {
        return FirUploadResponse.builder()
                .id(fir.getId())
                .firNumber(fir.getFirNumber())
                .title(fir.getTitle())
                .description(fir.getDescription())
                .fileHash(fir.getFileHash())
                .fileName(fir.getFileName())
                .fileSize(fir.getFileSize())
                .uploadedAt(fir.getUploadedAt())
                .status(fir.getStatus())
                .caseId(fir.getCaseId())
                .uploadedByName(fir.getUploadedBy() != null ? fir.getUploadedBy().getName() : null)
                .filedByName(fir.getFiledBy() != null ? fir.getFiledBy().getName() : null)
                .incidentDate(fir.getIncidentDate())
                .incidentLocation(fir.getIncidentLocation())
                .aiGenerated(fir.getAiGenerated())
                .reviewNotes(fir.getReviewNotes())
                .verified(true)
                .build();
    }

    // Inner class for police stats response
    @lombok.Getter
    @lombok.Setter
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class FirStatsResponse {
        private long totalFirs;
        private long sealedFirs;
        private long linkedFirs;
        private long firsToday;
    }

    // Inner class for client stats response
    @lombok.Getter
    @lombok.Setter
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class ClientFirStatsResponse {
        private long totalFirs;
        private long pendingFirs;
        private long registeredFirs;
        private long rejectedFirs;
    }
}

