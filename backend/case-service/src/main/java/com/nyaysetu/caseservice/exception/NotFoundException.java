package com.nyaysetu.caseservice.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException() { super(); }
    public NotFoundException(String message) { super(message); }
    public NotFoundException(String message, Throwable cause) { super(message, cause); }
    public NotFoundException(Throwable cause) { super(cause); }
}