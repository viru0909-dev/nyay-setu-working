package com.nyaysetu.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Long id;
    private Long consultationId;
    private Double amount;
    private String status;
    private String invoiceUrl;
    private String refundReason;
}
