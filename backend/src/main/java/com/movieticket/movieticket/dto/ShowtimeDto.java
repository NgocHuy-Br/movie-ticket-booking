package com.movieticket.movieticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeDto {
    private Long id;
    private Long movieId;
    private String movieTitle;
    private Long theaterId;
    private String theaterName;
    private Long roomId;
    private String roomName;
    private LocalDate showDate;
    private LocalTime showTime;
    private BigDecimal price;
    private Integer availableSeats;
    private Integer totalSeats;
}
