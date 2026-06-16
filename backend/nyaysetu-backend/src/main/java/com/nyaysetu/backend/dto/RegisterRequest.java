package com.nyaysetu.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for the public self-registration endpoint.
 *
 * NOTE: There is intentionally NO `role` field here.
 * Public registration always creates a LITIGANT account.
 * Elevated roles (JUDGE, POLICE, LAWYER, ADMIN, etc.) are
 * provisioned only by an admin through a separate secured endpoint.
 * Accepting a caller-supplied role here would allow any anonymous
 * user to self-escalate to JUDGE or ADMIN privileges.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
