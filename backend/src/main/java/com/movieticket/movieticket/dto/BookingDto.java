package com.movieticket.movieticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private Long id;
    private String ticketCode;
    private Long userId;
    private String userName;
    private Long movieId;
    private String movieTitle;
    private Long theaterId;
    private String theaterName;
    private Long showtimeId;
    private LocalDate showDate;
    private LocalTime showTime;
    private List<String> seats;
    private Integer numberOfSeats;
    private BigDecimal totalPrice;
    private String status; // ACTIVE, CANCELLED
    private Boolean canCancel;
    private LocalDateTime bookingDate;
}
