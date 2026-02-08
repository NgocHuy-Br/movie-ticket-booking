package com.movieticket.movieticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsResponse {
    private Long totalUsers;
    private Long totalMovies;
    private Long totalTheaters;
    private Long totalBookings;
    private BigDecimal totalRevenue;
    private Long todayBookings;
    private BigDecimal todayRevenue;
    private Map<String, Long> bookingsByStatus;
    private Map<String, Long> topMovies;
    private Map<String, BigDecimal> revenueByMonth;
}
