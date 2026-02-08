package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.dto.PaymentHistoryDto;
import com.movieticket.movieticket.dto.TopUpRequest;
import com.movieticket.movieticket.entity.PaymentHistory;
import com.movieticket.movieticket.entity.User;
import com.movieticket.movieticket.repository.PaymentHistoryRepository;
import com.movieticket.movieticket.repository.UserRepository;
import com.movieticket.movieticket.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentHistoryRepository paymentHistoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PaymentHistoryDto topUp(TopUpRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Cộng tiền vào tài khoản
        user.setAccountBalance(user.getAccountBalance().add(request.getAmount()));
        userRepository.save(user);

        // Lưu lịch sử nạp tiền
        PaymentHistory payment = new PaymentHistory();
        payment.setUser(user);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(getPaymentMethodName(request.getPaymentMethod()));
        payment.setType(PaymentHistory.PaymentType.TOPUP);
        payment.setStatus(PaymentHistory.PaymentStatus.COMPLETED);
        payment.setPaymentDate(LocalDateTime.now());

        PaymentHistory savedPayment = paymentHistoryRepository.save(payment);
        return convertToDto(savedPayment);
    }

    @Override
    public List<PaymentHistoryDto> getUserPaymentHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return paymentHistoryRepository.findByUserIdOrderByPaymentDateDesc(user.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private String getPaymentMethodName(String method) {
        return switch (method.toLowerCase()) {
            case "momo" -> "Ví MoMo";
            case "zalopay" -> "Ví ZaloPay";
            case "bank" -> "Chuyển khoản ngân hàng";
            default -> method;
        };
    }

    private PaymentHistoryDto convertToDto(PaymentHistory payment) {
        return PaymentHistoryDto.builder()
                .id(payment.getId())
                .type(payment.getType().name())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus().name())
                .ticketCode(payment.getBooking() != null ? payment.getBooking().getTicketCode() : null)
                .paymentDate(payment.getPaymentDate())
                .build();
    }
}
