package com.movieticket.movieticket.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieticket.movieticket.dto.BookingDto;
import com.movieticket.movieticket.dto.BookingRequest;
import com.movieticket.movieticket.entity.*;
import com.movieticket.movieticket.repository.*;
import com.movieticket.movieticket.service.BookingService;
import com.movieticket.movieticket.service.SystemSettingsService;
import com.movieticket.movieticket.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final WalletService walletService;
    private final SystemSettingsService systemSettingsService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public BookingDto createBooking(BookingRequest request, String username) {
        // Lấy thông tin user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lấy thông tin showtime
        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Showtime not found"));

        // Kiểm tra và đặt ghế
        List<Seat> seatsToBook = new ArrayList<>();
        for (String seatNumber : request.getSeats()) {
            Seat seat = seatRepository.findByShowtimeIdAndSeatNumber(showtime.getId(), seatNumber)
                    .orElseThrow(() -> new RuntimeException("Seat not found: " + seatNumber));

            if (seat.getStatus() == Seat.SeatStatus.OCCUPIED) {
                throw new RuntimeException("Seat already occupied: " + seatNumber);
            }

            seat.setStatus(Seat.SeatStatus.OCCUPIED);
            seat.setBookedByUser(user);
            seatsToBook.add(seat);
        }

        // Cập nhật số ghế còn trống
        int bookedSeats = request.getSeats().size();
        showtime.setAvailableSeats(showtime.getAvailableSeats() - bookedSeats);

        // Tính tổng tiền
        BigDecimal totalPrice = showtime.getPrice().multiply(BigDecimal.valueOf(bookedSeats));

        // Kiểm tra số dư nếu thanh toán bằng tài khoản Movie
        if ("movie".equalsIgnoreCase(request.getPaymentMethod())
                || "wallet".equalsIgnoreCase(request.getPaymentMethod())) {
            if (user.getAccountBalance().compareTo(totalPrice) < 0) {
                throw new RuntimeException("Insufficient balance. Please top up or choose another payment method.");
            }

            // Trừ tiền từ tài khoản
            user.setAccountBalance(user.getAccountBalance().subtract(totalPrice));
            userRepository.save(user);
        }

        // Tạo mã vé
        String ticketCode = generateTicketCode();
        while (bookingRepository.existsByTicketCode(ticketCode)) {
            ticketCode = generateTicketCode();
        }

        // Tạo booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setMovie(showtime.getMovie());
        booking.setTheater(showtime.getTheater());
        booking.setShowtime(showtime);
        booking.setShowDate(showtime.getShowDate());
        booking.setShowTime(showtime.getShowTime());
        booking.setTicketCode(ticketCode);

        // Chuyển danh sách ghế thành JSON string
        try {
            booking.setSeats(objectMapper.writeValueAsString(request.getSeats()));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize seats", e);
        }

        booking.setTotalAmount(totalPrice);
        booking.setStatus(Booking.BookingStatus.PURCHASED);
        booking.setCanCancel(true); // Có thể hủy trong 60 phút

        Booking savedBooking = bookingRepository.save(booking);

        // Lưu ghế
        seatRepository.saveAll(seatsToBook);

        // Lưu lịch sử thanh toán
        PaymentHistory payment = new PaymentHistory();
        payment.setUser(user);
        payment.setBooking(savedBooking);
        payment.setAmount(totalPrice);
        payment.setPaymentMethod(getPaymentMethodName(request.getPaymentMethod()));
        payment.setType(PaymentHistory.PaymentType.PURCHASE);
        payment.setStatus(PaymentHistory.PaymentStatus.COMPLETED);
        payment.setPaymentDate(LocalDateTime.now());
        paymentHistoryRepository.save(payment);

        // Tạo transaction nếu thanh toán bằng Movie account
        if ("movie".equalsIgnoreCase(request.getPaymentMethod())
                || "wallet".equalsIgnoreCase(request.getPaymentMethod())) {
            String description = String.format("Thanh toán vé %s - %s - %d ghế",
                    showtime.getMovie().getTitle(),
                    ticketCode,
                    bookedSeats);
            walletService.createBookingPaymentTransaction(user.getId(), savedBooking.getId(), totalPrice, description);
        }

        return convertToDto(savedBooking);
    }

    @Override
    public List<BookingDto> getUserBookings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingDto> getUserBookingsWithFilters(String username, Booking.BookingStatus status, String sortBy,
            String sortOrder) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        // Filter by status
        if (status != null) {
            bookings = bookings.stream()
                    .filter(b -> b.getStatus() == status)
                    .collect(Collectors.toList());
        }

        // Sort
        if (sortBy != null && !sortBy.isEmpty()) {
            if ("showDate".equalsIgnoreCase(sortBy)) {
                bookings.sort((b1, b2) -> {
                    int comparison = b1.getShowtime().getShowDate().compareTo(b2.getShowtime().getShowDate());
                    if (comparison == 0) {
                        comparison = b1.getShowtime().getShowTime().compareTo(b2.getShowtime().getShowTime());
                    }
                    return "desc".equalsIgnoreCase(sortOrder) ? -comparison : comparison;
                });
            } else if ("bookingDate".equalsIgnoreCase(sortBy)) {
                bookings.sort((b1, b2) -> {
                    int comparison = b1.getCreatedAt().compareTo(b2.getCreatedAt());
                    return "desc".equalsIgnoreCase(sortOrder) ? -comparison : comparison;
                });
            }
        }

        return bookings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public BookingDto getBookingById(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to booking");
        }

        return convertToDto(booking);
    }

    @Override
    public BookingDto getBookingByTicketCode(String ticketCode, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new RuntimeException("Booking not found with ticket code: " + ticketCode));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to booking");
        }

        return convertToDto(booking);
    }

    @Override
    @Transactional
    public void cancelBooking(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to booking");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking already cancelled");
        }

        // Lấy thời gian tối thiểu trước suất chiếu từ system settings (mặc định 48 giờ)
        Integer minHoursBeforeShowtime = systemSettingsService.getIntValue("MIN_HOURS_BEFORE_CANCEL");

        // Kiểm tra thời gian hủy dựa vào suất chiếu
        LocalDateTime showtimeDateTime = LocalDateTime.of(booking.getShowDate(), booking.getShowTime());
        LocalDateTime cancellationDeadline = showtimeDateTime.minusHours(minHoursBeforeShowtime);

        if (LocalDateTime.now().isAfter(cancellationDeadline)) {
            throw new RuntimeException(String.format(
                    "Không thể hủy vé trong vòng %d giờ trước suất chiếu", minHoursBeforeShowtime));
        }

        // Hủy booking
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCanCancel(false);

        // Giải phóng ghế
        List<String> seatNumbers;
        try {
            seatNumbers = objectMapper.readValue(booking.getSeats(), List.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize seats", e);
        }

        for (String seatNumber : seatNumbers) {
            Seat seat = seatRepository.findByShowtimeIdAndSeatNumber(
                    booking.getShowtime().getId(), seatNumber)
                    .orElseThrow(() -> new RuntimeException("Seat not found: " + seatNumber));
            seat.setStatus(Seat.SeatStatus.AVAILABLE);
            seat.setBookedByUser(null);
            seatRepository.save(seat);
        }

        // Cập nhật số ghế còn trống
        Showtime showtime = booking.getShowtime();
        showtime.setAvailableSeats(showtime.getAvailableSeats() + seatNumbers.size());
        showtimeRepository.save(showtime);

        // Lấy tỷ lệ hoàn tiền từ system settings (mặc định 80%)
        BigDecimal refundPercentage = systemSettingsService.getDecimalValue("REFUND_PERCENTAGE");

        // Tính số tiền hoàn lại
        BigDecimal refundAmount = booking.getTotalAmount()
                .multiply(refundPercentage)
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);

        // Hoàn tiền vào ví
        PaymentHistory originalPayment = paymentHistoryRepository.findByBookingId(booking.getId())
                .stream().findFirst().orElse(null);

        if (originalPayment != null &&
                (originalPayment.getPaymentMethod().toLowerCase().contains("wallet") ||
                        originalPayment.getPaymentMethod().toLowerCase().contains("movie"))) {

            // Hoàn tiền vào ví theo tỷ lệ
            user.setAccountBalance(user.getAccountBalance().add(refundAmount));
            userRepository.save(user);

            // Lưu lịch sử hoàn tiền
            PaymentHistory refund = new PaymentHistory();
            refund.setUser(user);
            refund.setBooking(booking);
            refund.setAmount(refundAmount);
            refund.setPaymentMethod("Wallet Refund (" + refundPercentage.intValue() + "%)");
            refund.setType(PaymentHistory.PaymentType.REFUND);
            refund.setStatus(PaymentHistory.PaymentStatus.COMPLETED);
            refund.setPaymentDate(LocalDateTime.now());
            paymentHistoryRepository.save(refund);

            // Tạo transaction hoàn tiền
            String description = String.format("Hoàn tiền hủy vé %s - %s (%d%%)",
                    booking.getMovie().getTitle(),
                    booking.getTicketCode(),
                    refundPercentage.intValue());
            walletService.createRefundTransaction(user.getId(), booking.getId(), refundAmount, description);
        }

        bookingRepository.save(booking);
    }

    private String generateTicketCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder ticketCode = new StringBuilder(10);

        for (int i = 0; i < 10; i++) {
            ticketCode.append(characters.charAt(random.nextInt(characters.length())));
        }

        return ticketCode.toString();
    }

    private String getPaymentMethodName(String method) {
        return switch (method.toLowerCase()) {
            case "visa" -> "Thẻ Visa/Mastercard";
            case "wallet", "movie" -> "Ví Movie";
            case "momo" -> "Ví MoMo";
            case "zalopay" -> "Ví ZaloPay";
            case "bank" -> "Chuyển khoản ngân hàng";
            default -> method;
        };
    }

    private BookingDto convertToDto(Booking booking) {
        List<String> seatsList;
        try {
            seatsList = objectMapper.readValue(booking.getSeats(), List.class);
        } catch (JsonProcessingException e) {
            seatsList = new ArrayList<>();
        }

        // Kiểm tra canCancel dựa trên thời gian trước suất chiếu
        boolean canCancel = booking.getCanCancel() && booking.getStatus() == Booking.BookingStatus.PURCHASED;
        if (canCancel) {
            try {
                Integer minHoursBeforeShowtime = systemSettingsService.getIntValue("MIN_HOURS_BEFORE_CANCEL");
                LocalDateTime showtimeDateTime = LocalDateTime.of(
                        booking.getShowtime().getShowDate(),
                        booking.getShowtime().getShowTime());
                LocalDateTime cancellationDeadline = showtimeDateTime.minusHours(minHoursBeforeShowtime);
                canCancel = LocalDateTime.now().isBefore(cancellationDeadline);
            } catch (Exception e) {
                // Fallback to old logic if settings not available
                LocalDateTime cancellationDeadline = booking.getCreatedAt().plusMinutes(60);
                canCancel = LocalDateTime.now().isBefore(cancellationDeadline);
            }
        }

        return BookingDto.builder()
                .id(booking.getId())
                .ticketCode(booking.getTicketCode())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .userEmail(booking.getUser().getEmail())
                .userPhone(booking.getUser().getPhone())
                .userBirthDate(booking.getUser().getBirthDate())
                .userCmnd(booking.getUser().getCmnd())
                .movieId(booking.getMovie().getId())
                .movieTitle(booking.getMovie().getTitle())
                .theaterId(booking.getTheater().getId())
                .theaterName(booking.getTheater().getName())
                .showtimeId(booking.getShowtime().getId())
                .showDate(booking.getShowtime().getShowDate())
                .showTime(booking.getShowtime().getShowTime())
                .seats(seatsList)
                .numberOfSeats(seatsList.size())
                .totalPrice(booking.getTotalAmount())
                .status(booking.getStatus().name())
                .canCancel(canCancel)
                .bookingDate(booking.getCreatedAt())
                .build();
    }
}
