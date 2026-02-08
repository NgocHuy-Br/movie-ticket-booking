package com.movieticket.movieticket.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    
    @NotNull(message = "Showtime ID is required")
    private Long showtimeId;
    
    @NotEmpty(message = "Seats are required")
    private List<String> seats;  // Danh sách mã ghế: ["A1", "A2"]
    
    @NotNull(message = "Payment method is required")
    private String paymentMethod;  // momo, zalopay, bank, movie
}
