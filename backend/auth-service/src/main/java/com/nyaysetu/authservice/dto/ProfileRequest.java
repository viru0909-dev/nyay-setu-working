package com.nyaysetu.authservice.dto;

import lombok.Data;

@Data
public class ProfileRequest {
    private Long userId;
    private String address;
    private String phone;
    private String city;
    private String state;
    private String country;
    // note: for face image, we will accept multipart in controller
}