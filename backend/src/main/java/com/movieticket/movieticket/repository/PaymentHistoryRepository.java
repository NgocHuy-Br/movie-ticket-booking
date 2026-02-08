package com.movieticket.movieticket.repository;

import com.movieticket.movieticket.entity.PaymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, Long> {
    
    List<PaymentHistory> findByUserId(Long userId);
    
    List<PaymentHistory> findByUserIdOrderByPaymentDateDesc(Long userId);
    
    List<PaymentHistory> findByBookingId(Long bookingId);
    
    List<PaymentHistory> findByUserIdAndType(Long userId, PaymentHistory.PaymentType type);
}
