package com.nyaysetu.backend.service;

import com.nyaysetu.backend.dto.ClientFirRequest;
import com.nyaysetu.backend.dto.FirUploadRequest;
import com.nyaysetu.backend.dto.FirUploadResponse;
import com.nyaysetu.backend.entity.FirRecord;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.repository.FirRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final com.nyaysetu.backend.repository.CaseRepository caseRepository;
    private final GroqDocumentVerificationService groqService;
    private final com.nyaysetu.backend.notification.service.NotificationService notificationService;

    @Value("${app.upload.fir-path:uploads/fir}")
    private String firUploadPath;

    @Value("${app.upload.evidence-path:uploads/evidence}")
    private String evidenceUploadPath;

    /**
     * Upload FIR document, calculate SHA-256 hash, and store record
     */
    public FirUploadResponse uploadFir(MultipartFile file, FirUploadRequest request, User uploadedBy) {
        try {
            // Create upload directory if not exists
            Path uploadDir = Paths.get(firUploadPath).toAbsolutePath().normalize();
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
                Path uploadDir = Paths.get(firUploadPath).toAbsolutePath().normalize();
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
     * Start investigation on an FIR
     */
    public FirUploadResponse startInvestigation(Long firId, User policeOfficer) {
        FirRecord fir = firRecordRepository.findById(firId)
                .orElseThrow(() -> new RuntimeException("FIR not found with ID: " + firId));

        fir.setStatus("UNDER_INVESTIGATION");
        fir.setReviewedBy(policeOfficer);
        fir.setReviewedAt(LocalDateTime.now());
        
        FirRecord saved = firRecordRepository.save(fir);
        log.info("Investigation started for FIR {} by {}", fir.getFirNumber(), policeOfficer.getName());
        return mapToResponse(saved);
    }

    /**
     * Submit FIR findings to Court (Creates a Case)
     */
    @Transactional
    public FirUploadResponse submitToCourt(Long firId, String investigationFindings, User policeOfficer) {
        FirRecord fir = firRecordRepository.findById(firId)
                .orElseThrow(() -> new RuntimeException("FIR not found with ID: " + firId));
        
        log.info("⚖️ Submitting FIR {} to court. Filed by: {}", fir.getFirNumber(), fir.getFiledBy() != null ? fir.getFiledBy().getEmail() : "NULL");

        // update FIR details
        fir.setInvestigationDetails(investigationFindings);
        fir.setSubmittedToCourtAt(LocalDateTime.now());
        fir.setIsSubmittedToCourt(true);
        fir.setStatus("COURT_REVIEW_PENDING");
        
        // Create new Case Entity
        String petitionerName = fir.getFiledBy() != null ? fir.getFiledBy().getName() : "Unknown";
        CaseEntity newCase = CaseEntity.builder()
                .title("State vs " + (fir.getDescription().length() > 20 ? fir.getDescription().substring(0, 20) + "..." : fir.getDescription()))
                .description(fir.getDescription())
                .caseType("CRIMINAL") // Defaulting to criminal for FIRs
                .status(CaseStatus.PENDING_COGNIZANCE) // Initial status in court - Handover A
                .petitioner(petitionerName) // Use actual filer's name
                .respondent("Unknown (Investigation On-going)") // or extract from FIR if structure allows
                .respondentIdentified(false) // Respondent not yet identified
                .filedDate(LocalDateTime.now())
                .urgency("HIGH")
                .client(fir.getFiledBy()) // Link to original filer
                .filingMethod("POLICE_FIR")
                .judgeId(null) // Unassigned
                .assignedJudge(null)
                .build();
        
        CaseEntity savedCase = caseRepository.save(newCase);
        
        // Link FIR to Case
        fir.setCaseId(savedCase.getId());
        FirRecord savedFir = firRecordRepository.save(fir);
        
        log.info("FIR {} submitted to Court. Created Case ID: {}", fir.getFirNumber(), savedCase.getId());
        
        return mapToResponse(savedFir);
    }
    
    /**
     * Generate AI Summary for FIR
     */
    public String generateSummary(Long firId) {
        FirRecord fir = firRecordRepository.findById(firId)
                .orElseThrow(() -> new RuntimeException("FIR not found"));
        
        // Fetch evidence (mock logic for now as we don't have direct link yet, or use description)
        String evidence = fir.getInvestigationDetails() != null ? fir.getInvestigationDetails() : "No additional evidence recorded.";
        
        return groqService.generateInvestigationSummary(fir.getDescription(), evidence);
    }

    /**
     * Generate AI Draft for Court Submission
     */
    public String draftCourtSubmission(Long firId) {
        FirRecord fir = firRecordRepository.findById(firId)
                .orElseThrow(() -> new RuntimeException("FIR not found"));
        
        String findings = fir.getInvestigationDetails() != null ? fir.getInvestigationDetails() : "Investigation in progress.";
        String evidence = "Refer to attached file: " + fir.getFileName() + " (Hash: " + fir.getFileHash() + ")";
        
        return groqService.generateCourtSubmission(fir.getDescription(), findings, evidence);
    }
    
    /**
     * Add additional evidence to an FIR under investigation
     */
    public FirUploadResponse addEvidence(Long firId, MultipartFile file, String description, User uploadedBy) {
        try {
            FirRecord fir = firRecordRepository.findById(firId)
                    .orElseThrow(() -> new RuntimeException("FIR not found with ID: " + firId));

            // Validate status
            if (!"UNDER_INVESTIGATION".equals(fir.getStatus())) {
                throw new RuntimeException("Can only add evidence to cases under investigation");
            }

            // Create upload directory if not exists
            Path uploadDir = Paths.get(evidenceUploadPath).toAbsolutePath().normalize();
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

            // Save file
            file.transferTo(filePath.toFile());

            // Hash
            String fileHash = blockchainService.calculateFileHash(filePath.toFile());

            // Append evidence info to investigation notes (Case Diary)
            // Since we can't create formal EvidenceRecord without a CaseID, we log it here.
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            String evidenceEntry = String.format("\n\n[%s] EVIDENCE ADDED\nFile: %s\nHash: %s\nDescription: %s\n-----------------------------------", 
                timestamp, originalFilename, fileHash, description);
            
            String currentDetails = fir.getInvestigationDetails() != null ? fir.getInvestigationDetails() : "";
            fir.setInvestigationDetails(currentDetails + evidenceEntry);
            
            FirRecord saved = firRecordRepository.save(fir);
            return mapToResponse(saved);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload evidence: " + e.getMessage(), e);
        }
    }

    /**
     * Get FIRs under active investigation
     */
    public List<FirUploadResponse> getFirsUnderInvestigation() {
        return firRecordRepository.findByStatusOrderByUploadedAtDesc("UNDER_INVESTIGATION")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Police updates FIR status (REGISTERED or REJECTED)
     */
    /**
     * Police updates FIR status (REGISTERED or REJECTED)
     */
    @Transactional
    public FirUploadResponse updateFirStatus(Long firId, String status, String reviewNotes, User reviewedBy) {
        FirRecord fir = firRecordRepository.findById(firId)
                .orElseThrow(() -> new RuntimeException("FIR not found with ID: " + firId));

        fir.setStatus(status);
        fir.setReviewNotes(reviewNotes);
        fir.setReviewedAt(LocalDateTime.now());
        fir.setReviewedBy(reviewedBy);

        FirRecord saved = firRecordRepository.save(fir);
        log.info("FIR {} status updated to {} by {}", fir.getFirNumber(), status, reviewedBy.getName());

        // Auto-Create Court Case if FIR is REGISTERED (Accepted)
        if ("REGISTERED".equals(status) && fir.getCaseId() == null) {
            log.info("🚨 FIR {} Accepted! Auto-creating Court Case...", fir.getFirNumber());
            
            String caseDescription = fir.getDescription() != null ? fir.getDescription() : "No details provided";
            String caseTitleSuffix = caseDescription.length() > 20 ? caseDescription.substring(0, 20) + "..." : caseDescription;

            String petitionerName = fir.getFiledBy() != null ? fir.getFiledBy().getName() : "Unknown";
            CaseEntity newCase = CaseEntity.builder()
                    .title("State vs " + caseTitleSuffix)
                    .description("FIR REGISTERED: " + fir.getFirNumber() + "\n\n" + caseDescription)
                    .caseType("CRIMINAL")
                    .status(CaseStatus.PENDING_COGNIZANCE) 
                    .petitioner(petitionerName) // Use actual filer's name
                    .respondent("Unknown (Investigation On-going)") 
                    .respondentIdentified(false) // Respondent not yet identified
                    .filedDate(LocalDateTime.now())
                    .urgency("HIGH")
                    .client(fir.getFiledBy()) // Link to original filer
                    .filingMethod("POLICE_FIR")
                    .sourceFirId(fir.getId())
                    .build();
            
            CaseEntity savedCase = caseRepository.save(newCase);
            
            // Link FIR to Case
            fir.setCaseId(savedCase.getId());
            firRecordRepository.save(fir); // save again with case ID
            
            log.info("✅ Auto-created Criminal Case ID: {} for FIR {}", savedCase.getId(), fir.getFirNumber());

            // Notification Logic
            try {
                if (fir.getFiledBy() != null) {
                    com.nyaysetu.backend.notification.entity.Notification notif = com.nyaysetu.backend.notification.entity.Notification.builder()
                            .userId(fir.getFiledBy().getId())
                            .title("FIR Registered as Case")
                            .message("Your FIR " + fir.getFirNumber() + " has been registered as Court Case #" + savedCase.getId() + ". You can now hire a lawyer.")
                            .readFlag(false)
                            .createdAt(java.time.Instant.now())
                            .build();
                    notificationService.save(notif);
                }
            } catch (Exception e) {
                log.error("Failed to send notification", e);
            }
        }

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

