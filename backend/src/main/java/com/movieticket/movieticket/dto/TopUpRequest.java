package com.movieticket.movieticket.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopUpRequest {
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1000", message = "Minimum top-up amount is 1,000đ")
    private BigDecimal amount;
    
    @NotNull(message = "Payment method is required")
    private String paymentMethod;  // momo, zalopay, bank
}
