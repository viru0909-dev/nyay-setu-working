package com.nyaysetu.authservice.dto;

import com.nyaysetu.authservice.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String name;
    private String password;
    private Role role; // very important
}