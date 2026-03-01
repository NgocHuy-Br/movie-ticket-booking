package com.movieticket.movieticket.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieticket.movieticket.dto.BookingDto;
import com.movieticket.movieticket.dto.BookingRequest;
import com.movieticket.movieticket.entity.*;
import com.movieticket.movieticket.repository.*;
import com.movieticket.movieticket.service.BookingService;
import com.movieticket.movieticket.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
        if ("movie".equalsIgnoreCase(request.getPaymentMethod())) {
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
        if ("movie".equalsIgnoreCase(request.getPaymentMethod())) {
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

        // Kiểm tra thời gian hủy (trong vòng 60 phút)
        LocalDateTime cancellationDeadline = booking.getCreatedAt().plusMinutes(60);
        if (LocalDateTime.now().isAfter(cancellationDeadline)) {
            throw new RuntimeException("Cannot cancel booking after 60 minutes from booking time");
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

        // Hoàn tiền nếu thanh toán bằng tài khoản Movie
        PaymentHistory originalPayment = paymentHistoryRepository.findByBookingId(booking.getId())
                .stream().findFirst().orElse(null);

        if (originalPayment != null && originalPayment.getPaymentMethod().contains("Movie")) {
            user.setAccountBalance(user.getAccountBalance().add(booking.getTotalAmount()));
            userRepository.save(user);

            // Lưu lịch sử hoàn tiền
            PaymentHistory refund = new PaymentHistory();
            refund.setUser(user);
            refund.setBooking(booking);
            refund.setAmount(booking.getTotalAmount());
            refund.setPaymentMethod("Movie Account Refund");
            refund.setType(PaymentHistory.PaymentType.REFUND);
            refund.setStatus(PaymentHistory.PaymentStatus.COMPLETED);
            refund.setPaymentDate(LocalDateTime.now());
            paymentHistoryRepository.save(refund);

            // Tạo transaction hoàn tiền
            String description = String.format("Hoàn tiền hủy vé %s - %s",
                    booking.getMovie().getTitle(),
                    booking.getTicketCode());
            walletService.createRefundTransaction(user.getId(), booking.getId(), booking.getTotalAmount(), description);
        }

        bookingRepository.save(booking);
    }

    private String generateTicketCode() {
        LocalDateTime now = LocalDateTime.now();
        String datePart = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = new Random().nextInt(10000);
        return String.format("MV%s%04d", datePart, randomPart);
    }

    private String getPaymentMethodName(String method) {
        return switch (method.toLowerCase()) {
            case "momo" -> "Ví MoMo";
            case "zalopay" -> "Ví ZaloPay";
            case "bank" -> "Chuyển khoản ngân hàng";
            case "movie" -> "Movie Account";
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

        // Kiểm tra canCancel dựa trên thời gian
        boolean canCancel = booking.getCanCancel() && booking.getStatus() == Booking.BookingStatus.PURCHASED;
        if (canCancel) {
            LocalDateTime cancellationDeadline = booking.getCreatedAt().plusMinutes(60);
            canCancel = LocalDateTime.now().isBefore(cancellationDeadline);
        }

        return BookingDto.builder()
                .id(booking.getId())
                .ticketCode(booking.getTicketCode())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
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
