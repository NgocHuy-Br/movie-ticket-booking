package com.movieticket.movieticket.controller;

import com.movieticket.movieticket.dto.ApiResponse;
import com.movieticket.movieticket.dto.PaymentHistoryDto;
import com.movieticket.movieticket.dto.TopUpRequest;
import com.movieticket.movieticket.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
        "http://localhost:3000" })
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/topup")
    public ResponseEntity<ApiResponse<PaymentHistoryDto>> topUp(
            @Valid @RequestBody TopUpRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            PaymentHistoryDto payment = paymentService.topUp(request, username);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Top-up successful", payment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<PaymentHistoryDto>>> getPaymentHistory(
            Authentication authentication) {
        String username = authentication.getName();
        List<PaymentHistoryDto> history = paymentService.getUserPaymentHistory(username);
        return ResponseEntity.ok(ApiResponse.success("Get payment history successfully", history));
    }
}
