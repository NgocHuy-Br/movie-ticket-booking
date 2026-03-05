package com.movieticket.movieticket.service;

import com.movieticket.movieticket.dto.TransactionDto;
import com.movieticket.movieticket.entity.Transaction;

import java.math.BigDecimal;
import java.util.List;

public interface WalletService {

    /**
     * Nạp tiền vào ví
     */
    TransactionDto deposit(String username, BigDecimal amount, String description);

    /**
     * Lấy lịch sử giao dịch của user
     */
    List<TransactionDto> getTransactionHistory(String username);

    /**
     * Lấy lịch sử giao dịch theo loại
     */
    List<TransactionDto> getTransactionHistoryByType(String username, Transaction.TransactionType type);

    /**
     * Tạo transaction cho thanh toán booking
     */
    Transaction createBookingPaymentTransaction(Long userId, Long bookingId, BigDecimal amount, String description);

    /**
     * Tạo transaction cho thanh toán từ thẻ ngoài (Visa/Mastercard) - chỉ để lưu
     * lịch sử
     */
    Transaction createExternalPaymentTransaction(Long userId, Long bookingId, BigDecimal amount, String paymentMethod);

    /**
     * Tạo transaction cho hoàn tiền
     */
    Transaction createRefundTransaction(Long userId, Long bookingId, BigDecimal amount, String description);
}
