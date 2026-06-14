package com.nyaysetu.backend.util;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Component
public class PasswordValidator {
    
    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 64;
    
    private static final Pattern HAS_DIGIT = Pattern.compile(".*\\d.*");
    private static final Pattern HAS_LOWER = Pattern.compile(".*[a-z].*");
    private static final Pattern HAS_UPPER = Pattern.compile(".*[A-Z].*");
    private static final Pattern HAS_SPECIAL = Pattern.compile(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*");
    
    private static final String[] COMMON_PASSWORDS = {
        "password", "12345678", "qwerty123", "admin123", "welcome1",
        "passw0rd", "letmein", "test1234", "abc12345", "123456789"
    };
    
    public static ValidationResult validate(String password) {
        if (password == null || password.isEmpty()) {
            return ValidationResult.invalid("Password cannot be empty");
        }
        
        if (password.length() < MIN_LENGTH) {
            return ValidationResult.invalid("Password must be at least " + MIN_LENGTH + " characters");
        }
        
        if (password.length() > MAX_LENGTH) {
            return ValidationResult.invalid("Password must be at most " + MAX_LENGTH + " characters");
        }
        
        if (!HAS_DIGIT.matcher(password).matches()) {
            return ValidationResult.invalid("Password must contain at least one digit");
        }
        
        if (!HAS_LOWER.matcher(password).matches()) {
            return ValidationResult.invalid("Password must contain at least one lowercase letter");
        }
        
        if (!HAS_UPPER.matcher(password).matches()) {
            return ValidationResult.invalid("Password must contain at least one uppercase letter");
        }
        
        if (!HAS_SPECIAL.matcher(password).matches()) {
            return ValidationResult.invalid("Password must contain at least one special character (!@#$%^&*() etc.)");
        }
        
        String lowerPassword = password.toLowerCase();
        for (String common : COMMON_PASSWORDS) {
            if (lowerPassword.equals(common)) {
                return ValidationResult.invalid("Password is too common. Please choose a stronger password");
            }
        }
        
        return ValidationResult.valid();
    }
    
    public static class ValidationResult {
        private final boolean valid;
        private final String message;
        
        private ValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
        
        public static ValidationResult valid() {
            return new ValidationResult(true, null);
        }
        
        public static ValidationResult invalid(String message) {
            return new ValidationResult(false, message);
        }
        
        public boolean isValid() { return valid; }
        public String getMessage() { return message; }
    }
}
