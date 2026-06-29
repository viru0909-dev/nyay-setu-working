package com.nyaysetu.backend.service;

public class PiiSanitizationException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public PiiSanitizationException(String message) {
        super(message);
    }

    public PiiSanitizationException(String message, Throwable cause) {
        super(message, cause);
    }
}
