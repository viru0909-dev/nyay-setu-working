package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.EvidenceRecord;
import com.nyaysetu.backend.repository.EvidenceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final EvidenceRecordRepository evidenceRepository;
    private final com.nyaysetu.backend.repository.DocumentRepository documentRepository;

    public byte[] generateCertificate(UUID evidenceId) throws IOException {
        EvidenceRecord evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new RuntimeException("Evidence not found"));

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 18);
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("CERTIFICATE UNDER SECTION 63(4)");
                contentStream.newLineAtOffset(0, -25);
                contentStream.showText("OF BHARATIYA SAKSHYA ADHINIYAM, 2023");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.newLineAtOffset(50, 650);
                contentStream.setLeading(18f);

                contentStream.showText("I hereby certify that the electronic record with SHA-256 Hash:");
                contentStream.newLine();
                contentStream.setFont(PDType1Font.COURIER, 10);
                contentStream.showText(evidence.getFileHash() != null ? evidence.getFileHash() : "HASH_NOT_AVAILABLE");
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.newLine();
                contentStream.newLine();

                String time = evidence.getCreatedAt() != null ? 
                        evidence.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "UNKNOWN_TIME";
                String ip = evidence.getUploadIp() != null ? evidence.getUploadIp() : "UNKNOWN_IP";

                contentStream.showText("was generated on " + time);
                contentStream.newLine();
                contentStream.showText("from IP Address " + ip);
                contentStream.newLine();
                contentStream.showText("and has not been tampered with.");
                
                contentStream.newLine();
                contentStream.newLine();
                contentStream.showText("Signed: NyaySetu Digital Evidence Locker");
                
                contentStream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    /**
     * Generate Section 63(4) certificate for a DocumentEntity
     */
    public byte[] generateDocumentCertificate(UUID documentId) throws IOException {
        com.nyaysetu.backend.entity.DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                // Header
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 18);
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("CERTIFICATE UNDER SECTION 63(4)");
                contentStream.newLineAtOffset(0, -25);
                contentStream.showText("OF BHARATIYA SAKSHYA ADHINIYAM, 2023");
                contentStream.endText();

                // Body
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.newLineAtOffset(50, 650);
                contentStream.setLeading(18f);

                contentStream.showText("I hereby certify that the electronic record with SHA-256 Hash:");
                contentStream.newLine();
                contentStream.setFont(PDType1Font.COURIER, 10);
                contentStream.showText(doc.getFileHash() != null ? doc.getFileHash() : "HASH_NOT_AVAILABLE");
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.newLine();
                contentStream.newLine();

                String time = doc.getUploadedAt() != null ? 
                        doc.getUploadedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "UNKNOWN_TIME";
                String ip = doc.getUploadIp() != null ? doc.getUploadIp() : "UNKNOWN_IP";
                String fileName = doc.getFileName() != null ? doc.getFileName() : "UNKNOWN_FILE";

                contentStream.showText("File Name: " + fileName);
                contentStream.newLine();
                contentStream.showText("was generated on " + time);
                contentStream.newLine();
                contentStream.showText("from IP Address " + ip);
                contentStream.newLine();
                contentStream.showText("and has not been tampered with.");
                
                contentStream.newLine();
                contentStream.newLine();
                contentStream.showText("This certificate verifies the integrity of the digital evidence");
                contentStream.newLine();
                contentStream.showText("as per the provisions of the Bharatiya Sakshya Adhiniyam, 2023.");
                
                contentStream.newLine();
                contentStream.newLine();
                contentStream.newLine();
                contentStream.showText("Signed: NyaySetu Digital Evidence Locker");
                
                contentStream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }
}
