package com.movieticket.movieticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistoryDto {
    private Long id;
    private String type;  // PURCHASE, TOPUP, REFUND
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private String ticketCode;
    private LocalDateTime paymentDate;
}
