package com.movieticket.movieticket.service;

import com.movieticket.movieticket.dto.PaymentHistoryDto;
import com.movieticket.movieticket.dto.TopUpRequest;

import java.util.List;

public interface PaymentService {
    
    PaymentHistoryDto topUp(TopUpRequest request, String username);
    
    List<PaymentHistoryDto> getUserPaymentHistory(String username);
}
