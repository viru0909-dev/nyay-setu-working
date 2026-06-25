package com.nyaysetu.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class VerificationRequestNotFoundException extends RuntimeException {
    
    public VerificationRequestNotFoundException(String message) {
        super(message);
    }
}

