package com.movieticket.movieticket.controller;

import com.movieticket.movieticket.dto.ApiResponse;
import com.movieticket.movieticket.dto.BookingDto;
import com.movieticket.movieticket.dto.BookingRequest;
import com.movieticket.movieticket.entity.Booking;
import com.movieticket.movieticket.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingDto>> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            BookingDto booking = bookingService.createBooking(request, username);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Booking created successfully", booking));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingDto>>> getUserBookings(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder) {
        String username = authentication.getName();

        // If filters are provided, use filtered method
        if (status != null || sortBy != null) {
            Booking.BookingStatus bookingStatus = null;
            if (status != null && !status.isEmpty()) {
                try {
                    bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid status value: " + status));
                }
            }
            List<BookingDto> bookings = bookingService.getUserBookingsWithFilters(username, bookingStatus, sortBy,
                    sortOrder);
            return ResponseEntity.ok(ApiResponse.success("Get user bookings successfully", bookings));
        }

        // Otherwise use default method
        List<BookingDto> bookings = bookingService.getUserBookings(username);
        return ResponseEntity.ok(ApiResponse.success("Get user bookings successfully", bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDto>> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            BookingDto booking = bookingService.getBookingById(id, username);
            return ResponseEntity.ok(ApiResponse.success("Get booking successfully", booking));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/ticket/{ticketCode}")
    public ResponseEntity<ApiResponse<BookingDto>> getBookingByTicketCode(
            @PathVariable String ticketCode,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            BookingDto booking = bookingService.getBookingByTicketCode(ticketCode, username);
            return ResponseEntity.ok(ApiResponse.success("Get booking successfully", booking));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            bookingService.cancelBooking(id, username);
            return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
