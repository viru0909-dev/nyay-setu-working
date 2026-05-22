package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.Consultation;
import com.nyaysetu.backend.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultationEmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${mail.from:noreply@nyaysetu.com}")
    private String mailFromName;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendBookingConfirmation(Consultation consultation) {
        try {
            String clientEmail = consultation.getClient().getEmail();
            String lawyerEmail = consultation.getLawyer().getUser().getEmail();
            String formattedTime = consultation.getScheduledTime()
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm a"));

            // Email to Client
            sendEmailToClient(
                    clientEmail,
                    "Consultation Booking Confirmed",
                    buildClientBookingEmail(
                            consultation.getClient().getName(),
                            consultation.getLawyer().getUser().getName(),
                            formattedTime,
                            consultation.getDurationMinutes()
                    )
            );

            // Email to Lawyer
            sendEmailToLawyer(
                    lawyerEmail,
                    "New Consultation Booking",
                    buildLawyerBookingEmail(
                            consultation.getLawyer().getUser().getName(),
                            consultation.getClient().getName(),
                            formattedTime,
                            consultation.getDurationMinutes()
                    )
            );

            log.info("Booking confirmation emails sent - Consultation ID: {}", consultation.getId());
        } catch (Exception e) {
            log.error("Error sending booking confirmation email for consultation {}", 
                    consultation.getId(), e);
        }
    }

    @Async
    public void sendPaymentConfirmation(Payment payment, Consultation consultation) {
        try {
            String clientEmail = consultation.getClient().getEmail();
            String lawyerEmail = consultation.getLawyer().getUser().getEmail();
            String formattedTime = consultation.getScheduledTime()
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm a"));

            // Email to Client
            sendEmailToClient(
                    clientEmail,
                    "Payment Confirmation - Consultation Booking",
                    buildClientPaymentEmail(
                            consultation.getClient().getName(),
                            consultation.getLawyer().getUser().getName(),
                            formattedTime,
                            payment.getAmount(),
                            consultation.getZoomMeetingUrl()
                    )
            );

            // Email to Lawyer with meeting link
            if (consultation.getZoomMeetingUrl() != null) {
                sendEmailToLawyer(
                        lawyerEmail,
                        "Consultation Payment Received",
                        buildLawyerPaymentEmail(
                                consultation.getLawyer().getUser().getName(),
                                consultation.getClient().getName(),
                                formattedTime,
                                payment.getAmount(),
                                consultation.getZoomMeetingUrl()
                        )
                );
            }

            log.info("Payment confirmation emails sent - Payment ID: {}", payment.getId());
        } catch (Exception e) {
            log.error("Error sending payment confirmation email for payment {}", 
                    payment.getId(), e);
        }
    }

    @Async
    public void sendReminderEmail(Consultation consultation) {
        try {
            String clientEmail = consultation.getClient().getEmail();
            String lawyerEmail = consultation.getLawyer().getUser().getEmail();
            String formattedTime = consultation.getScheduledTime()
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm a"));

            // Email to Client
            sendEmailToClient(
                    clientEmail,
                    "Reminder: Consultation with " + consultation.getLawyer().getUser().getName(),
                    buildClientReminderEmail(
                            consultation.getClient().getName(),
                            consultation.getLawyer().getUser().getName(),
                            formattedTime,
                            consultation.getZoomMeetingUrl()
                    )
            );

            // Email to Lawyer
            sendEmailToLawyer(
                    lawyerEmail,
                    "Reminder: Consultation with " + consultation.getClient().getName(),
                    buildLawyerReminderEmail(
                            consultation.getLawyer().getUser().getName(),
                            consultation.getClient().getName(),
                            formattedTime,
                            consultation.getZoomMeetingUrl()
                    )
            );

            log.info("Reminder emails sent - Consultation ID: {}", consultation.getId());
        } catch (Exception e) {
            log.error("Error sending reminder email for consultation {}", 
                    consultation.getId(), e);
        }
    }

    @Async
    public void sendCancellationEmail(Consultation consultation, String reason) {
        try {
            String clientEmail = consultation.getClient().getEmail();
            String lawyerEmail = consultation.getLawyer().getUser().getEmail();
            String formattedTime = consultation.getScheduledTime()
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm a"));

            // Email to Client
            sendEmailToClient(
                    clientEmail,
                    "Consultation Cancelled",
                    buildClientCancellationEmail(
                            consultation.getClient().getName(),
                            consultation.getLawyer().getUser().getName(),
                            formattedTime,
                            reason
                    )
            );

            // Email to Lawyer
            sendEmailToLawyer(
                    lawyerEmail,
                    "Consultation Cancelled",
                    buildLawyerCancellationEmail(
                            consultation.getLawyer().getUser().getName(),
                            consultation.getClient().getName(),
                            formattedTime
                    )
            );

            log.info("Cancellation emails sent - Consultation ID: {}", consultation.getId());
        } catch (Exception e) {
            log.error("Error sending cancellation email for consultation {}", 
                    consultation.getId(), e);
        }
    }

    @Async
    public void sendFeedbackRequest(Consultation consultation) {
        try {
            String clientEmail = consultation.getClient().getEmail();
            sendEmailToClient(
                    clientEmail,
                    "Share Your Feedback - Consultation with " + consultation.getLawyer().getUser().getName(),
                    buildFeedbackRequestEmail(
                            consultation.getClient().getName(),
                            consultation.getLawyer().getUser().getName(),
                            frontendUrl + "/litigant/consultations/" + consultation.getId()
                    )
            );

            log.info("Feedback request email sent - Consultation ID: {}", consultation.getId());
        } catch (Exception e) {
            log.error("Error sending feedback request email for consultation {}", 
                    consultation.getId(), e);
        }
    }

    // HTML Email Builders
    private String buildClientBookingEmail(String clientName, String lawyerName, 
                                          String dateTime, Integer duration) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Consultation Booking Confirmed ✓</h2>
                    <p>Hi %s,</p>
                    <p>Your consultation with <strong>%s</strong> has been successfully booked!</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Date & Time:</strong> %s</p>
                        <p><strong>Duration:</strong> %d minutes</p>
                    </div>
                    
                    <p>You will receive a payment link to complete the booking. Once payment is confirmed, 
                    you'll receive the Zoom meeting link.</p>
                    
                    <p>If you have any questions, contact us at support@nyaysetu.com</p>
                    <p>Best regards,<br>NyaySetu Team</p>
                </body>
                </html>
                """, clientName, lawyerName, dateTime, duration);
    }

    private String buildClientPaymentEmail(String clientName, String lawyerName, String dateTime,
                                          Double amount, String meetingUrl) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Payment Confirmed ✓</h2>
                    <p>Hi %s,</p>
                    <p>Thank you for completing your payment. Your consultation is confirmed!</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Lawyer:</strong> %s</p>
                        <p><strong>Amount Paid:</strong> ₹%.2f</p>
                        <p><strong>Date & Time:</strong> %s</p>
                    </div>
                    
                    %s
                    
                    <p>Thank you for using NyaySetu!</p>
                    <p>Best regards,<br>NyaySetu Team</p>
                </body>
                </html>
                """, clientName, lawyerName, amount, dateTime, 
                meetingUrl != null ? String.format("<p><a href=\"%s\" style=\"background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">Join Zoom Meeting</a></p>", meetingUrl) : "");
    }

    private String buildClientReminderEmail(String clientName, String lawyerName, 
                                           String dateTime, String meetingUrl) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Reminder: Your Consultation is Tomorrow</h2>
                    <p>Hi %s,</p>
                    <p>This is a reminder that you have a consultation scheduled with <strong>%s</strong>.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Date & Time:</strong> %s</p>
                    </div>
                    
                    %s
                    
                    <p>Please ensure you have a stable internet connection and a quiet environment for the meeting.</p>
                    <p>Best regards,<br>NyaySetu Team</p>
                </body>
                </html>
                """, clientName, lawyerName, dateTime,
                meetingUrl != null ? String.format("<p><a href=\"%s\" style=\"background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">Join Meeting Now</a></p>", meetingUrl) : "");
    }

    private String buildClientCancellationEmail(String clientName, String lawyerName, 
                                               String dateTime, String reason) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Consultation Cancelled</h2>
                    <p>Hi %s,</p>
                    <p>Your consultation with <strong>%s</strong> on <strong>%s</strong> has been cancelled.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Reason:</strong> %s</p>
                    </div>
                    
                    <p>A refund will be processed to your original payment method within 5-7 business days.</p>
                    
                    <p>To book another consultation, visit <a href="%s">NyaySetu Lawyers</a></p>
                    <p>Best regards,<br>NyaySetu Team</p>
                </body>
                </html>
                """, clientName, lawyerName, dateTime, reason, frontendUrl + "/litigant/lawyers");
    }

    private String buildFeedbackRequestEmail(String clientName, String lawyerName, String feedbackUrl) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Share Your Feedback</h2>
                    <p>Hi %s,</p>
                    <p>Thank you for your consultation with <strong>%s</strong>. We'd love to hear about your experience!</p>
                    
                    <p><a href="%s" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Share Feedback</a></p>
                    
                    <p>Your feedback helps us improve our services and helps other users find the best lawyers.</p>
                    <p>Best regards,<br>NyaySetu Team</p>
                </body>
                </html>
                """, clientName, lawyerName, feedbackUrl);
    }

    // Lawyer emails
    private String buildLawyerBookingEmail(String lawyerName, String clientName, 
                                          String dateTime, Integer duration) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>New Consultation Booking</h2>
                    <p>Hi %s,</p>
                    <p>You have a new consultation booking from <strong>%s</strong>.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Client:</strong> %s</p>
                        <p><strong>Date & Time:</strong> %s</p>
                        <p><strong>Duration:</strong> %d minutes</p>
                    </div>
                    
                    <p>The booking is pending payment confirmation from the client.</p>
                    <p>Best regards,<br>NyaySetu Team</p>
                </body>
                </html>
                """, lawyerName, clientName, clientName, dateTime, duration);
    }

    private String buildLawyerPaymentEmail(String lawyerName, String clientName, String dateTime,
                                          Double amount, String meetingUrl) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Consultation Payment Received</h2>
                    <p>Hi %s,</p>
                    <p>Payment has been received for your consultation with <strong>%s</strong>.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Client:</strong> %s</p>
                        <p><strong>Amount:</strong> ₹%.2f</p>
                        <p><strong>Date & Time:</strong> %s</p>
                    </div>
                    
                    <p><a href="%s" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">Join Zoom Meeting</a></p>
                    
                    <p>Best regards,<br>NyaySetu Team</p>
                </body>
                </html>
                """, lawyerName, clientName, clientName, amount, dateTime, meetingUrl);
    }

    private String buildLawyerReminderEmail(String lawyerName, String clientName, 
                                           String dateTime, String meetingUrl) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Reminder: Consultation Tomorrow</h2>
                    <p>Hi %s,</p>
                    <p>This is a reminder that you have a consultation with <strong>%s</strong> tomorrow.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Date & Time:</strong> %s</p>
                    </div>
                    
                    <p><a href="%s" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">Join Meeting</a></p>
                    
                    <p>Best regards,<br>NyaySetu Team</p>
                </body>
                </html>
                """, lawyerName, clientName, dateTime, meetingUrl);
    }

    private String buildLawyerCancellationEmail(String lawyerName, String clientName, String dateTime) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Consultation Cancelled</h2>
                    <p>Hi %s,</p>
                    <p>The consultation with <strong>%s</strong> scheduled for <strong>%s</strong> has been cancelled.</p>
                    
                    <p>Best regards,<br>NyaySetu Team</p>
                </body>
                </html>
                """, lawyerName, clientName, dateTime);
    }

    private void sendEmailToClient(String email, String subject, String htmlContent) throws MessagingException {
        sendHtmlEmail(email, subject, htmlContent);
    }

    private void sendEmailToLawyer(String email, String subject, String htmlContent) throws MessagingException {
        sendHtmlEmail(email, subject, htmlContent);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}
