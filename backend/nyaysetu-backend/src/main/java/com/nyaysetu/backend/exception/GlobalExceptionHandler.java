package com.nyaysetu.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import java.time.Instant;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonFormat;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        ErrorResponse error = new ErrorResponse("Validation Failed", message, 400);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    public ResponseEntity<ErrorResponse> handleNoHandlerFound(Exception e) {
        ErrorResponse error = new ErrorResponse("Not Found", "The requested resource does not exist", 404);
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e) {
        ErrorResponse error = new ErrorResponse("Forbidden", e.getMessage(), 403);
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException e) {
        ErrorResponse error = new ErrorResponse("Not Found", e.getMessage(), 404);
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(org.springframework.security.access.AccessDeniedException e) {
        ErrorResponse error = new ErrorResponse("Forbidden", "You do not have permission to access this resource", 403);
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(org.springframework.dao.DataIntegrityViolationException e) {
        ErrorResponse error = new ErrorResponse("Conflict", "Database integrity constraint violation occurred", 409);
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        ErrorResponse error = new ErrorResponse("Bad Request", e.getMessage(), 400);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception e) {
        ErrorResponse error = new ErrorResponse("Internal Server Error", e.getMessage(), 500);
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExistsException(
            UserAlreadyExistsException e) {

        ErrorResponse error = new ErrorResponse(
                "Conflict",
                e.getMessage(),
                409
        );

        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    public static class ErrorResponse {
        private String error;
        private String message;
        private int status;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
        private Instant timestamp;

        public ErrorResponse(String error, String message, int status) {
            this.error = error;
            this.message = message;
            this.status = status;
            this.timestamp = Instant.now();
        }

        public String getError() {
            return error;
        }

        public String getMessage() {
            return message;
        }

        public int getStatus() {
            return status;
        }

        public Instant getTimestamp() {
            return timestamp;
        }
    }
}
