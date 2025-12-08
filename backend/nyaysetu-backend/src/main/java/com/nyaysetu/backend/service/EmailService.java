package com.nyaysetu.backend.service;

import com.nyaysetu.backend.entity.PasswordResetToken;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.PasswordResetTokenRepository;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.password-reset.token-validity:1800000}") // 30 min default
    private Long tokenValidityMs;

    @Async
    public void sendPasswordResetEmail(String email) throws MessagingException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete any existing tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate new token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusSeconds(tokenValidityMs / 1000);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();

        tokenRepository.save(resetToken);

        // Create reset link
        String resetLink = frontendUrl + "/reset-password/" + token;

        // Send email
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(email);
        helper.setSubject("NyaySetu - Password Reset Request");
        helper.setText(buildEmailContent(user.getName(), resetLink), true);

        mailSender.send(message);
        log.info("Password reset email sent to: {}", email);
    }

    private String buildEmailContent(String userName, String resetLink) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #6366f1 0%%, #8b5cf6 100%%); padding: 40px 30px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 32px; font-weight: 800; }
                        .content { padding: 40px 30px; }
                        .content p { color: #4b5563; line-height: 1.6; font-size: 16px; }
                        .button { display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #818cf8 0%%, #c084fc 100%%); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; margin: 20px 0; }
                        .button:hover { opacity: 0.9; }
                        .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
                        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 8px; }
                        .warning p { margin: 0; color: #92400e; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 NyaySetu</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
                            <p>Hello %s,</p>
                            <p>We received a request to reset your password for your NyaySetu account. Click the button below to create a new password:</p>
                            <center>
                                <a href="%s" class="button">Reset My Password</a>
                            </center>
                            <div class="warning">
                                <p><strong>⏰ Important:</strong> This link will expire in 30 minutes for security reasons.</p>
                            </div>
                            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                                If the button doesn't work, copy and paste this link into your browser:<br>
                                <a href="%s" style="color: #8b5cf6; word-break: break-all;">%s</a>
                            </p>
                        </div>
                        <div class="footer">
                            <p style="margin: 0 0 10px 0; font-weight: 600; color: white;">NyaySetu - Virtual Judiciary Platform</p>
                            <p style="margin: 0;">Delivering justice through technology 🇮🇳</p>
                        </div>
                    </div>
                </body>
                </html>
                """, userName, resetLink, resetLink, resetLink);
    }

    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
        log.info("Cleaned up expired password reset tokens");
    }
}
