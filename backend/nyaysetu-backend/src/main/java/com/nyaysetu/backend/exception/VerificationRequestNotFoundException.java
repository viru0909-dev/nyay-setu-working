package com.nyaysetu.backend.exception;

public class VerificationRequestNotFoundException extends RuntimeException {

    public VerificationRequestNotFoundException(String message) {
        super(message);
    }
}
