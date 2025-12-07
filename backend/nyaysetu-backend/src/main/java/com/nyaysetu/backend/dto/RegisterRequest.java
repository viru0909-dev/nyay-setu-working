package com.nyaysetu.backend.dto;

import com.nyaysetu.backend.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String name;
    private String password;
    private Role role; // very important
}