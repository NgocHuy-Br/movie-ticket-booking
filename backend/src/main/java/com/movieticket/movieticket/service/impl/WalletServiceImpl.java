package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.dto.TransactionDto;
import com.movieticket.movieticket.entity.Booking;
import com.movieticket.movieticket.entity.Transaction;
import com.movieticket.movieticket.entity.User;
import com.movieticket.movieticket.repository.BookingRepository;
import com.movieticket.movieticket.repository.TransactionRepository;
import com.movieticket.movieticket.repository.UserRepository;
import com.movieticket.movieticket.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

        private final UserRepository userRepository;
        private final TransactionRepository transactionRepository;
        private final BookingRepository bookingRepository;

        @Override
        @Transactional
        public TransactionDto deposit(String username, BigDecimal amount, String description) {
                if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new RuntimeException("Số tiền nạp phải lớn hơn 0");
                }

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                BigDecimal balanceBefore = user.getAccountBalance();
                BigDecimal balanceAfter = balanceBefore.add(amount);

                user.setAccountBalance(balanceAfter);
                userRepository.save(user);

                Transaction transaction = new Transaction();
                transaction.setUser(user);
                transaction.setType(Transaction.TransactionType.DEPOSIT);
                transaction.setAmount(amount);
                transaction.setBalanceBefore(balanceBefore);
                transaction.setBalanceAfter(balanceAfter);
                transaction.setDescription(description != null ? description : "Nạp tiền vào ví");

                Transaction savedTransaction = transactionRepository.save(transaction);
                return convertToDto(savedTransaction);
        }

        @Override
        public List<TransactionDto> getTransactionHistory(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return transactionRepository.findByUserOrderByCreatedAtDesc(user).stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
        }

        @Override
        public List<TransactionDto> getTransactionHistoryByType(String username, Transaction.TransactionType type) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return transactionRepository.findByUserAndTypeOrderByCreatedAtDesc(user, type).stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public Transaction createBookingPaymentTransaction(Long userId, Long bookingId, BigDecimal amount,
                        String description) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Booking booking = bookingRepository.findById(bookingId).orElse(null);

                BigDecimal balanceBefore = user.getAccountBalance();
                BigDecimal balanceAfter = balanceBefore.subtract(amount);

                Transaction transaction = new Transaction();
                transaction.setUser(user);
                transaction.setType(Transaction.TransactionType.BOOKING_PAYMENT);
                transaction.setAmount(amount.negate()); // Số âm cho thanh toán
                transaction.setBalanceBefore(balanceBefore);
                transaction.setBalanceAfter(balanceAfter);
                transaction.setBooking(booking);
                transaction.setDescription(description != null ? description : "Thanh toán đặt vé");

                return transactionRepository.save(transaction);
        }

        @Override
        @Transactional
        public Transaction createExternalPaymentTransaction(Long userId, Long bookingId, BigDecimal amount,
                        String paymentMethod) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Booking booking = bookingRepository.findById(bookingId).orElse(null);

                // Không thay đổi số dư ví vì thanh toán từ thẻ ngoài
                BigDecimal currentBalance = user.getAccountBalance();

                Transaction transaction = new Transaction();
                transaction.setUser(user);
                transaction.setType(Transaction.TransactionType.BOOKING_PAYMENT);
                transaction.setAmount(amount.negate()); // Số âm để hiển thị là chi tiêu
                transaction.setBalanceBefore(currentBalance);
                transaction.setBalanceAfter(currentBalance); // Không thay đổi
                transaction.setBooking(booking);

                String ticketCode = booking != null ? booking.getTicketCode() : "";
                String movieTitle = booking != null && booking.getMovie() != null ? booking.getMovie().getTitle() : "";
                transaction.setDescription(String.format("Thanh toán vé %s (%s) - Phương thức: %s (Không trừ từ ví)",
                                movieTitle, ticketCode, paymentMethod));

                return transactionRepository.save(transaction);
        }

        @Override
        @Transactional
        public Transaction createRefundTransaction(Long userId, Long bookingId, BigDecimal amount, String description) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Booking booking = bookingRepository.findById(bookingId).orElse(null);

                BigDecimal balanceBefore = user.getAccountBalance();
                BigDecimal balanceAfter = balanceBefore.add(amount);

                Transaction transaction = new Transaction();
                transaction.setUser(user);
                transaction.setType(Transaction.TransactionType.REFUND);
                transaction.setAmount(amount);
                transaction.setBalanceBefore(balanceBefore);
                transaction.setBalanceAfter(balanceAfter);
                transaction.setBooking(booking);
                transaction.setDescription(description != null ? description : "Hoàn tiền hủy vé");

                return transactionRepository.save(transaction);
        }

        private TransactionDto convertToDto(Transaction transaction) {
                return TransactionDto.builder()
                                .id(transaction.getId())
                                .type(transaction.getType().name())
                                .amount(transaction.getAmount())
                                .balanceBefore(transaction.getBalanceBefore())
                                .balanceAfter(transaction.getBalanceAfter())
                                .bookingId(transaction.getBooking() != null ? transaction.getBooking().getId() : null)
                                .ticketCode(transaction.getBooking() != null ? transaction.getBooking().getTicketCode()
                                                : null)
                                .description(transaction.getDescription())
                                .createdAt(transaction.getCreatedAt())
                                .build();
        }
}
