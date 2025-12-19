package com.nyaysetu.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
@Slf4j
public class PdfTextExtractorService {
    
    /**
     * Extract text from PDF file
     * @param pdfFile PDF file to extract text from
     * @return Extracted text content (limited to 30,000 characters)
     * @throws IOException if file reading fails
     */
    public String extractText(File pdfFile) throws IOException {
        log.info("Extracting text from PDF: {}", pdfFile.getName());
        
        try (PDDocument document = PDDocument.load(pdfFile)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            
            // Limit to first 30,000 characters to stay within Gemini API token limits
            if (text.length() > 30000) {
                log.warn("PDF text exceeds 30,000 characters, truncating");
                text = text.substring(0, 30000);
            }
            
            log.info("Successfully extracted {} characters from PDF", text.length());
            return text;
        } catch (IOException e) {
            log.error("Failed to extract text from PDF: {}", pdfFile.getName(), e);
            throw e;
        }
    }
    
    /**
     * Check if file is a valid PDF
     */
    public boolean isPdf(String fileName) {
        return fileName != null && fileName.toLowerCase().endsWith(".pdf");
    }
}
