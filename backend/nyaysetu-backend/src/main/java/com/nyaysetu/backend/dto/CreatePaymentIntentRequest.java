package com.nyaysetu.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePaymentIntentRequest {

    private Long consultationId;
    private Double amount;
    private String returnUrl;

}