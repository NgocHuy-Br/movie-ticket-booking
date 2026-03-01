package com.movieticket.movieticket.controller;

import com.movieticket.movieticket.dto.ApiResponse;
import com.movieticket.movieticket.dto.TransactionDto;
import com.movieticket.movieticket.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<TransactionDto>> deposit(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {
        try {
            String username = authentication.getName();
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String description = request.containsKey("description") ? request.get("description").toString() : null;

            TransactionDto transaction = walletService.deposit(username, amount, description);
            return ResponseEntity.ok(ApiResponse.success("Nạp tiền thành công", transaction));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionDto>>> getTransactionHistory(
            Authentication authentication,
            @RequestParam(required = false) String type) {
        try {
            String username = authentication.getName();
            List<TransactionDto> transactions;

            if (type != null && !type.isEmpty()) {
                transactions = walletService.getTransactionHistoryByType(
                        username,
                        com.movieticket.movieticket.entity.Transaction.TransactionType.valueOf(type));
            } else {
                transactions = walletService.getTransactionHistory(username);
            }

            return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử giao dịch thành công", transactions));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
