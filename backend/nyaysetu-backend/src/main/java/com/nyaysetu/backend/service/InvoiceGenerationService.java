package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.Consultation;
import com.nyaysetu.backend.entity.Payment;
import com.nyaysetu.backend.repository.PaymentRepository;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class InvoiceGenerationService {
    private final PaymentRepository paymentRepository;

    public byte[] generateInvoicePDF(Long paymentId) {
        try {
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

            Consultation consultation = payment.getConsultation();
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            PdfFont titleFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont normalFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont smallFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            // Header
            Paragraph header = new Paragraph("INVOICE")
                    .setFont(titleFont)
                    .setFontSize(24)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(header);

            Paragraph companyName = new Paragraph("NyaySetu Legal Services")
                    .setFont(normalFont)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(companyName);

            // Invoice Details
            Paragraph invoiceDetails = new Paragraph()
                    .setFont(smallFont)
                    .setFontSize(10)
                    .add("Invoice #: " + paymentId + "\n")
                    .add("Date: " + new SimpleDateFormat("dd MMM yyyy").format(new Date()) + "\n")
                    .add("Payment Status: " + payment.getStatus());
            document.add(invoiceDetails);

            document.add(new Paragraph("\n"));

            // Service Details
            Paragraph serviceHeader = new Paragraph("SERVICE DETAILS")
                    .setFont(titleFont)
                    .setFontSize(12);
            document.add(serviceHeader);

            Table serviceTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}));
            serviceTable.setWidth(UnitValue.createPercentValue(100));

            addTableCell(serviceTable, "Service", normalFont, true);
            addTableCell(serviceTable, "Details", normalFont, true);

            addTableCell(serviceTable, "Lawyer", normalFont, false);
            addTableCell(serviceTable, consultation.getLawyer().getUser().getName(), normalFont, false);

            addTableCell(serviceTable, "Date & Time", normalFont, false);
            String formattedDateTime = consultation.getScheduledTime()
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"));
            addTableCell(serviceTable, formattedDateTime, normalFont, false);

            addTableCell(serviceTable, "Duration", normalFont, false);
            addTableCell(serviceTable, consultation.getDurationMinutes() + " minutes", normalFont, false);

            addTableCell(serviceTable, "Hourly Rate", normalFont, false);
            addTableCell(serviceTable, "₹" + consultation.getLawyer().getHourlyRate(), normalFont, false);

            document.add(serviceTable);

            document.add(new Paragraph("\n"));

            // Payment Details
            Paragraph paymentHeader = new Paragraph("PAYMENT DETAILS")
                    .setFont(titleFont)
                    .setFontSize(12);
            document.add(paymentHeader);

            Table paymentTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}));
            paymentTable.setWidth(UnitValue.createPercentValue(100));

            double duration = consultation.getDurationMinutes();
            double hourlyRate = consultation.getLawyer().getHourlyRate();
            double subtotal = (hourlyRate * duration) / 60;
            double tax = subtotal * 0.18; // 18% GST
            double total = subtotal + tax;

            addTableCell(paymentTable, "Description", normalFont, true);
            addTableCell(paymentTable, "Amount", normalFont, true);

            addTableCell(paymentTable, "Consultation Fee", normalFont, false);
            addTableCell(paymentTable, "₹" + String.format("%.2f", subtotal), normalFont, false);

            addTableCell(paymentTable, "GST (18%)", normalFont, false);
            addTableCell(paymentTable, "₹" + String.format("%.2f", tax), normalFont, false);

            addTableCell(paymentTable, "Total Amount", titleFont, true);
            addTableCell(paymentTable, "₹" + String.format("%.2f", total), titleFont, true);

            document.add(paymentTable);

            document.add(new Paragraph("\n"));

            // Terms
            Paragraph termsHeader = new Paragraph("TERMS & CONDITIONS")
                    .setFont(titleFont)
                    .setFontSize(12);
            document.add(termsHeader);

            Paragraph terms = new Paragraph()
                    .setFont(smallFont)
                    .setFontSize(9)
                    .add("• This invoice is valid for the consultation service provided on the specified date.\n")
                    .add("• Payment must be completed before joining the consultation.\n")
                    .add("• Refunds are subject to our refund policy.\n")
                    .add("• For any disputes, contact support@nyaysetu.com");
            document.add(terms);

            // Footer
            document.add(new Paragraph("\n\n"));
            Paragraph footer = new Paragraph("Thank you for using NyaySetu!")
                    .setFont(smallFont)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10);
            document.add(footer);

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Error generating invoice PDF for payment {}", paymentId, e);
            throw new RuntimeException("Failed to generate invoice: " + e.getMessage());
        }
    }

    private void addTableCell(Table table, String content, PdfFont font, boolean isHeader) {
        Cell cell = new Cell();
        cell.add(new Paragraph(content).setFont(font));
        if (isHeader) {
            cell.setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY);
        }
        table.addCell(cell);
    }

    public void saveInvoiceToDB(Long paymentId, byte[] invoiceBytes) {
        try {
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

            // Store as Base64 in database or as HTML
            String invoiceHtml = "<div>Invoice generated for Payment ID: " + paymentId + "</div>";
            payment.setInvoiceHtml(invoiceHtml);
            payment.setUpdatedAt(System.currentTimeMillis());
            paymentRepository.save(payment);

            log.info("Invoice stored for payment {}", paymentId);
        } catch (Exception e) {
            log.error("Error saving invoice to DB for payment {}", paymentId, e);
        }
    }
}
