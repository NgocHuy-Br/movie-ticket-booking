package com.movieticket.movieticket.controller;

import com.movieticket.movieticket.dto.*;
import com.movieticket.movieticket.entity.Booking;
import com.movieticket.movieticket.repository.*;
import com.movieticket.movieticket.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class AdminController {

    private final MovieService movieService;
    private final TheaterService theaterService;
    private final ShowtimeService showtimeService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;

    // ==================== MOVIES MANAGEMENT ====================

    @PostMapping("/movies")
    public ResponseEntity<ApiResponse<MovieDto>> createMovie(@RequestBody MovieDto movieDto) {
        try {
            MovieDto created = movieService.createMovie(movieDto);
            return ResponseEntity.ok(ApiResponse.success("Movie created successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/movies/{id}")
    public ResponseEntity<ApiResponse<MovieDto>> updateMovie(
            @PathVariable Long id,
            @RequestBody MovieDto movieDto) {
        try {
            MovieDto updated = movieService.updateMovie(id, movieDto);
            return ResponseEntity.ok(ApiResponse.success("Movie updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/movies/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.ok(ApiResponse.success("Movie deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== THEATERS MANAGEMENT ====================

    @PostMapping("/theaters")
    public ResponseEntity<ApiResponse<TheaterDto>> createTheater(@RequestBody TheaterDto theaterDto) {
        try {
            TheaterDto created = theaterService.createTheater(theaterDto);
            return ResponseEntity.ok(ApiResponse.success("Theater created successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/theaters/{id}")
    public ResponseEntity<ApiResponse<TheaterDto>> updateTheater(
            @PathVariable Long id,
            @RequestBody TheaterDto theaterDto) {
        try {
            TheaterDto updated = theaterService.updateTheater(id, theaterDto);
            return ResponseEntity.ok(ApiResponse.success("Theater updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/theaters/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTheater(@PathVariable Long id) {
        try {
            theaterService.deleteTheater(id);
            return ResponseEntity.ok(ApiResponse.success("Theater deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== SHOWTIMES MANAGEMENT ====================

    @PostMapping("/showtimes")
    public ResponseEntity<ApiResponse<ShowtimeDto>> createShowtime(@RequestBody ShowtimeDto showtimeDto) {
        try {
            ShowtimeDto created = showtimeService.createShowtime(showtimeDto);
            return ResponseEntity.ok(ApiResponse.success("Showtime created successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/showtimes/{id}")
    public ResponseEntity<ApiResponse<ShowtimeDto>> updateShowtime(
            @PathVariable Long id,
            @RequestBody ShowtimeDto showtimeDto) {
        try {
            ShowtimeDto updated = showtimeService.updateShowtime(id, showtimeDto);
            return ResponseEntity.ok(ApiResponse.success("Showtime updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/showtimes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteShowtime(@PathVariable Long id) {
        try {
            showtimeService.deleteShowtime(id);
            return ResponseEntity.ok(ApiResponse.success("Showtime deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== STATISTICS & REPORTS ====================

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<StatisticsResponse>> getStatistics() {
        try {
            // Total counts
            Long totalUsers = userRepository.count();
            Long totalMovies = movieRepository.count();
            Long totalTheaters = theaterRepository.count();
            Long totalBookings = bookingRepository.count();

            // Total revenue (all PURCHASED bookings)
            BigDecimal totalRevenue = bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus() == Booking.BookingStatus.PURCHASED)
                    .map(Booking::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Today's bookings and revenue
            LocalDate today = LocalDate.now();
            List<Booking> todayBookings = bookingRepository.findAll().stream()
                    .filter(b -> b.getCreatedAt().toLocalDate().equals(today))
                    .collect(Collectors.toList());

            Long todayBookingsCount = (long) todayBookings.size();
            BigDecimal todayRevenue = todayBookings.stream()
                    .filter(b -> b.getStatus() == Booking.BookingStatus.PURCHASED)
                    .map(Booking::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Bookings by status
            Map<String, Long> bookingsByStatus = bookingRepository.findAll().stream()
                    .collect(Collectors.groupingBy(
                            b -> b.getStatus().name(),
                            Collectors.counting()));

            // Top 5 movies by bookings
            Map<String, Long> topMovies = bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus() == Booking.BookingStatus.PURCHASED)
                    .collect(Collectors.groupingBy(
                            b -> b.getMovie().getTitle(),
                            Collectors.counting()))
                    .entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(5)
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            Map.Entry::getValue,
                            (e1, e2) -> e1,
                            LinkedHashMap::new));

            // Revenue by month (last 6 months)
            Map<String, BigDecimal> revenueByMonth = new LinkedHashMap<>();
            LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);

            bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus() == Booking.BookingStatus.PURCHASED)
                    .filter(b -> b.getCreatedAt().isAfter(sixMonthsAgo))
                    .collect(Collectors.groupingBy(
                            b -> b.getCreatedAt().getYear() + "-" +
                                    String.format("%02d", b.getCreatedAt().getMonthValue()),
                            Collectors.reducing(
                                    BigDecimal.ZERO,
                                    Booking::getTotalAmount,
                                    BigDecimal::add)))
                    .entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .forEach(e -> revenueByMonth.put(e.getKey(), e.getValue()));

            StatisticsResponse stats = StatisticsResponse.builder()
                    .totalUsers(totalUsers)
                    .totalMovies(totalMovies)
                    .totalTheaters(totalTheaters)
                    .totalBookings(totalBookings)
                    .totalRevenue(totalRevenue)
                    .todayBookings(todayBookingsCount)
                    .todayRevenue(todayRevenue)
                    .bookingsByStatus(bookingsByStatus)
                    .topMovies(topMovies)
                    .revenueByMonth(revenueByMonth)
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve statistics: " + e.getMessage()));
        }
    }
}
