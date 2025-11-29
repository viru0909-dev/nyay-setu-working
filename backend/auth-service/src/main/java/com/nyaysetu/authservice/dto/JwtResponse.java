package com.nyaysetu.authservice.dto;

import com.nyaysetu.authservice.entity.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponse {
    private String token;
    private String email;
    private Role role;
}