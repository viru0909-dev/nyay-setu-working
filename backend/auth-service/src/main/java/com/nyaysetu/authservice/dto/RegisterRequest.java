package com.nyaysetu.authservice.dto;

import com.nyaysetu.authservice.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    @NotBlank private String name;
    @NotBlank @Email private String email;
    @NotBlank private String password;
    private Role role;
}