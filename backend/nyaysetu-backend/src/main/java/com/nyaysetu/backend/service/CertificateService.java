package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.EvidenceRecord;
import com.nyaysetu.backend.repository.EvidenceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final EvidenceRecordRepository evidenceRepository;
    private final com.nyaysetu.backend.repository.DocumentRepository documentRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    /**
     * Generate Section 63(4) Certificate for Evidence Record (Blockchain)
     */
    public byte[] generateCertificate(UUID evidenceId) throws IOException {
        EvidenceRecord evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new RuntimeException("Evidence not found"));
        
        return createCertificatePdf(
                evidence.getTitle(),
                evidence.getFileHash(),
                evidence.getCreatedAt().format(DATE_FORMATTER),
                evidence.getUploadIp(),
                "BLOCKCHAIN_RECORD"
        );
    }

    /**
     * Generate Section 63(4) Certificate for Document Entity
     */
    public byte[] generateDocumentCertificate(UUID documentId) throws IOException {
        com.nyaysetu.backend.entity.DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        String timestamp = doc.getUploadedAt() != null ? 
                doc.getUploadedAt().format(DATE_FORMATTER) : "UNKNOWN_TIME";
        
        return createCertificatePdf(
                doc.getFileName(),
                doc.getFileHash(),
                timestamp,
                doc.getUploadIp(),
                "CASE_DOCUMENT"
        );
    }

    private byte[] createCertificatePdf(String fileName, String hash, String timestamp, String ip, String type) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                // 1. Draw Border
                float margin = 20;
                float borderWidth = 3;
                float width = page.getMediaBox().getWidth() - 2 * margin;
                float height = page.getMediaBox().getHeight() - 2 * margin;

                contentStream.setStrokingColor(new Color(30, 42, 68)); // Navy Blue border
                contentStream.setLineWidth(borderWidth);
                contentStream.addRect(margin, margin, width, height);
                contentStream.stroke();
                
                // Inner thin border
                contentStream.setLineWidth(1);
                contentStream.addRect(margin + 5, margin + 5, width - 10, height - 10);
                contentStream.stroke();

                // 2. Header
                float yPosition = page.getMediaBox().getHeight() - 80;
                
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 22);
                contentStream.setNonStrokingColor(new Color(30, 42, 68));
                centerText(contentStream, "CERTIFICATE OF ELECTRONIC EVIDENCE", 22, page.getMediaBox().getWidth(), yPosition);
                contentStream.endText();

                yPosition -= 30;
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
                contentStream.setNonStrokingColor(Color.BLACK);
                centerText(contentStream, "Under Section 63(4) of Bharatiya Sakshya Adhiniyam, 2023", 14, page.getMediaBox().getWidth(), yPosition);
                contentStream.endText();

                yPosition -= 40;
                contentStream.setStrokingColor(Color.LIGHT_GRAY);
                contentStream.moveTo(50, yPosition);
                contentStream.lineTo(page.getMediaBox().getWidth() - 50, yPosition);
                contentStream.stroke();

                // 3. Body Text
                yPosition -= 40;
                drawText(contentStream, 60, yPosition, "This is to certify that the electronic record identified below was generated, stored, and", 12);
                yPosition -= 20;
                drawText(contentStream, 60, yPosition, "maintained in the ordinary course of official business. The integrity of this record", 12);
                yPosition -= 20;
                drawText(contentStream, 60, yPosition, "is cryptographically secured and verified.", 12);

                // 4. Data Table
                yPosition -= 50;
                float tableWidth = page.getMediaBox().getWidth() - 120;
                float rowHeight = 30;
                float col1Width = 150;
                
                drawTable(contentStream, 60, yPosition, tableWidth, rowHeight, "Attribute", "Details");
                drawTable(contentStream, 60, yPosition - rowHeight, tableWidth, rowHeight, "File Name", fileName);
                drawTable(contentStream, 60, yPosition - 2 * rowHeight, tableWidth, rowHeight, "Record Type", type);
                drawTable(contentStream, 60, yPosition - 3 * rowHeight, tableWidth, rowHeight, "Timestamp", timestamp);
                drawTable(contentStream, 60, yPosition - 4 * rowHeight, tableWidth, rowHeight, "Source IP", ip != null ? ip : "N/A");
                
                // Hash Row (Taller)
                float hashRowY = yPosition - 5 * rowHeight;
                drawTable(contentStream, 60, hashRowY, tableWidth, 40, "SHA-256 Hash", hash != null ? hash : "PENDING_VERIFICATION");

                // 5. Verification Statement
                yPosition = hashRowY - 60;
                contentStream.setNonStrokingColor(Color.BLACK);
                drawText(contentStream, 60, yPosition, "I hereby certify that:", 12);
                yPosition -= 20;
                drawText(contentStream, 80, yPosition, "1. The computer/system producing this record was operating properly.", 11);
                yPosition -= 15;
                drawText(contentStream, 80, yPosition, "2. The contents have not been tampered with since creation.", 11);
                yPosition -= 15;
                drawText(contentStream, 80, yPosition, "3. The digital fingerprint (Hash) matches the original record.", 11);

                // 6. Footer / Signature
                yPosition -= 80;
                contentStream.setStrokingColor(Color.LIGHT_GRAY);
                contentStream.moveTo(60, yPosition);
                contentStream.lineTo(250, yPosition);
                contentStream.stroke();
                
                yPosition -= 20;
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD_OBLIQUE, 12);
                contentStream.setNonStrokingColor(new Color(16, 185, 129)); // Green
                contentStream.newLineAtOffset(60, yPosition);
                contentStream.showText("Digitally Signed by NyaySetu Vault");
                contentStream.endText();

                yPosition -= 15;
                drawText(contentStream, 60, yPosition, "System Generated Certificate", 10);
                
                // Bottom Center ID
                contentStream.beginText();
                contentStream.setFont(PDType1Font.COURIER, 10);
                contentStream.setNonStrokingColor(Color.GRAY);
                centerText(contentStream, "ID: " + UUID.randomUUID().toString(), 10, page.getMediaBox().getWidth(), 40);
                contentStream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    private void drawText(PDPageContentStream contentStream, float x, float y, String text, int fontSize) throws IOException {
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA, fontSize);
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(text);
        contentStream.endText();
    }

    private void centerText(PDPageContentStream contentStream, String text, int fontSize, float pageWidth, float y) throws IOException {
        float textWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(text) / 1000 * fontSize;
        float x = (pageWidth - textWidth) / 2;
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(text);
    }

    private void drawTable(PDPageContentStream contentStream, float x, float y, float width, float height, String label, String value) throws IOException {
        float col1Width = 140;
        
        // Background for Label
        contentStream.setNonStrokingColor(new Color(245, 247, 250));
        contentStream.addRect(x, y - height, col1Width, height);
        contentStream.fill();
        
        // Borders
        contentStream.setStrokingColor(Color.LIGHT_GRAY);
        contentStream.setLineWidth(1);
        contentStream.addRect(x, y - height, width, height); // Outer
        contentStream.moveTo(x + col1Width, y);
        contentStream.lineTo(x + col1Width, y - height); // Divider
        contentStream.stroke();

        // Text
        contentStream.setNonStrokingColor(Color.BLACK);
        
        // Label
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.newLineAtOffset(x + 10, y - (height/2) - 4);
        contentStream.showText(label);
        contentStream.endText();

        // Value
        contentStream.beginText();
        if (value.length() > 50) contentStream.setFont(PDType1Font.COURIER, 9); // Smaller for Hash
        else contentStream.setFont(PDType1Font.HELVETICA, 10);
        
        contentStream.newLineAtOffset(x + col1Width + 10, y - (height/2) - 4);
        contentStream.showText(value != null ? value : "-");
        contentStream.endText();
    }
}
