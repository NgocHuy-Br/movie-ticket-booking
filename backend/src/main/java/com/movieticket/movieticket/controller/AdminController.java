package com.movieticket.movieticket.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieticket.movieticket.dto.*;
import com.movieticket.movieticket.entity.Booking;
import com.movieticket.movieticket.entity.CinemaRoom;
import com.movieticket.movieticket.entity.Theater;
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
    private final GenreService genreService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;
    private final ShowtimeRepository showtimeRepository;
    private final CinemaRoomRepository cinemaRoomRepository;
    private final ObjectMapper objectMapper;

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

    @PostMapping("/movies/update-statuses")
    public ResponseEntity<ApiResponse<String>> updateAllMovieStatuses() {
        try {
            movieService.updateAllMovieStatuses();
            return ResponseEntity.ok(ApiResponse.success("All movie statuses updated successfully",
                    "Đã cập nhật trạng thái tất cả phim"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/movies/{id}/update-status")
    public ResponseEntity<ApiResponse<String>> updateMovieStatus(@PathVariable Long id) {
        try {
            movieService.updateMovieStatus(id);
            return ResponseEntity.ok(ApiResponse.success("Movie status updated successfully",
                    "Đã cập nhật trạng thái phim"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GENRES MANAGEMENT ====================

    @GetMapping("/genres")
    public ResponseEntity<ApiResponse<List<GenreDto>>> getAllGenres() {
        try {
            List<GenreDto> genres = genreService.getAllGenres();
            return ResponseEntity.ok(ApiResponse.success("Genres retrieved successfully", genres));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/genres/active")
    public ResponseEntity<ApiResponse<List<GenreDto>>> getActiveGenres() {
        try {
            List<GenreDto> genres = genreService.getActiveGenres();
            return ResponseEntity.ok(ApiResponse.success("Active genres retrieved successfully", genres));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/genres/{id}")
    public ResponseEntity<ApiResponse<GenreDto>> getGenreById(@PathVariable Long id) {
        try {
            GenreDto genre = genreService.getGenreById(id);
            return ResponseEntity.ok(ApiResponse.success("Genre retrieved successfully", genre));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/genres")
    public ResponseEntity<ApiResponse<GenreDto>> createGenre(@RequestBody GenreDto genreDto) {
        try {
            GenreDto created = genreService.createGenre(genreDto);
            return ResponseEntity.ok(ApiResponse.success("Genre created successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/genres/{id}")
    public ResponseEntity<ApiResponse<GenreDto>> updateGenre(
            @PathVariable Long id,
            @RequestBody GenreDto genreDto) {
        try {
            GenreDto updated = genreService.updateGenre(id, genreDto);
            return ResponseEntity.ok(ApiResponse.success("Genre updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/genres/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGenre(@PathVariable Long id) {
        try {
            genreService.deleteGenre(id);
            return ResponseEntity.ok(ApiResponse.success("Genre deleted successfully", null));
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

    // ==================== USER MANAGEMENT ====================

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        try {
            List<UserDto> users = userRepository.findAll().stream()
                    .map(user -> UserDto.builder()
                            .id(user.getId())
                            .cmnd(user.getCmnd())
                            .name(user.getName())
                            .birthDate(user.getBirthDate())
                            .phone(user.getPhone())
                            .address(user.getAddress())
                            .email(user.getEmail())
                            .username(user.getUsername())
                            .avatar(user.getAvatar())
                            .role(user.getRole().name())
                            .membershipLevel(user.getMembershipLevel().name())
                            .points(user.getPoints())
                            .accountBalance(user.getAccountBalance())
                            .createdAt(user.getCreatedAt())
                            .updatedAt(user.getUpdatedAt())
                            .build())
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Get all users successfully", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get users: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {
        try {
            // Validate role enum
            com.movieticket.movieticket.entity.User.Role roleEnum;
            try {
                roleEnum = com.movieticket.movieticket.entity.User.Role.valueOf(role);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid role. Must be USER or ADMIN"));
            }

            var user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setRole(roleEnum);
            userRepository.save(user);

            UserDto userDto = UserDto.builder()
                    .id(user.getId())
                    .cmnd(user.getCmnd())
                    .name(user.getName())
                    .birthDate(user.getBirthDate())
                    .phone(user.getPhone())
                    .address(user.getAddress())
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .avatar(user.getAvatar())
                    .role(user.getRole().name())
                    .membershipLevel(user.getMembershipLevel().name())
                    .points(user.getPoints())
                    .accountBalance(user.getAccountBalance())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("User role updated successfully", userDto));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update user role: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/membership")
    public ResponseEntity<ApiResponse<UserDto>> updateUserMembership(
            @PathVariable Long id,
            @RequestParam String membershipLevel) {
        try {
            // Validate membership level enum
            com.movieticket.movieticket.entity.User.MembershipLevel membershipEnum;
            try {
                membershipEnum = com.movieticket.movieticket.entity.User.MembershipLevel.valueOf(membershipLevel);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid membership level. Must be NORMAL, GOLD, or PLATINUM"));
            }

            var user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setMembershipLevel(membershipEnum);
            userRepository.save(user);

            UserDto userDto = UserDto.builder()
                    .id(user.getId())
                    .cmnd(user.getCmnd())
                    .name(user.getName())
                    .birthDate(user.getBirthDate())
                    .phone(user.getPhone())
                    .address(user.getAddress())
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .avatar(user.getAvatar())
                    .role(user.getRole().name())
                    .membershipLevel(user.getMembershipLevel().name())
                    .points(user.getPoints())
                    .accountBalance(user.getAccountBalance())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("User membership updated successfully", userDto));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update user membership: " + e.getMessage()));
        }
    }

    // ==================== BOOKING MANAGEMENT ====================

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getAllBookings() {
        try {
            List<BookingDto> bookings = bookingRepository.findAll().stream()
                    .map(booking -> {
                        try {
                            List<String> seatsList = objectMapper.readValue(booking.getSeats(), List.class);
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
                                    .canCancel(false) // Admin view - không cho cancel từ đây
                                    .bookingDate(booking.getCreatedAt())
                                    .build();
                        } catch (Exception e) {
                            throw new RuntimeException("Failed to parse seats: " + e.getMessage());
                        }
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Get all bookings successfully", bookings));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get bookings: " + e.getMessage()));
        }
    }

    @GetMapping("/bookings/search")
    public ResponseEntity<ApiResponse<BookingDto>> searchBookingByTicketCode(@RequestParam String ticketCode) {
        try {
            var booking = bookingRepository.findByTicketCode(ticketCode)
                    .orElseThrow(() -> new RuntimeException("Booking not found with ticket code: " + ticketCode));

            List<String> seatsList = objectMapper.readValue(booking.getSeats(), List.class);

            BookingDto bookingDto = BookingDto.builder()
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
                    .canCancel(false)
                    .bookingDate(booking.getCreatedAt())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Booking found", bookingDto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Server error: " + e.getMessage()));
        }
    }

    // ==================== CINEMA ROOMS MIGRATION ====================

    /**
     * Migrate old cinema rooms to standardized format
     * DELETE all showtimes and cinema rooms, then recreate rooms with format "Phòng
     * 01, 02,..."
     * Each room: 10 rows × 8 cols = 80 seats
     * WARNING: This will delete all existing showtimes and cinema rooms!
     */
    @PostMapping("/migrate-cinema-rooms")
    public ResponseEntity<ApiResponse<Map<String, Object>>> migrateCinemaRooms() {
        try {
            // Step 1: Count current data
            long oldShowtimesCount = showtimeRepository.count();
            long oldRoomsCount = cinemaRoomRepository.count();

            // Step 2: Delete all showtimes
            showtimeRepository.deleteAll();

            // Step 3: Delete all cinema rooms
            cinemaRoomRepository.deleteAll();

            // Step 4: Recreate cinema rooms with standard format
            List<Theater> theaters = theaterRepository.findAll();
            int totalRoomsCreated = 0;

            for (Theater theater : theaters) {
                int totalRooms = theater.getTotalRooms() != null ? theater.getTotalRooms() : 1;

                for (int i = 1; i <= totalRooms; i++) {
                    CinemaRoom room = new CinemaRoom();
                    room.setTheater(theater);
                    room.setName(String.format("Phòng %02d", i));
                    room.setTotalRows(10);
                    room.setTotalCols(8);
                    cinemaRoomRepository.save(room);
                    totalRoomsCreated++;
                }
            }

            // Step 5: Return migration summary
            Map<String, Object> result = new HashMap<>();
            result.put("deletedShowtimes", oldShowtimesCount);
            result.put("deletedRooms", oldRoomsCount);
            result.put("createdRooms", totalRoomsCreated);
            result.put("theaters", theaters.size());
            result.put("message", String.format(
                    "✅ Migration thành công! Đã xóa %d suất chiếu và %d phòng cũ. Tạo mới %d phòng chuẩn cho %d rạp.",
                    oldShowtimesCount, oldRoomsCount, totalRoomsCreated, theaters.size()));

            return ResponseEntity.ok(ApiResponse.success("Migration completed", result));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Migration failed: " + e.getMessage()));
        }
    }
}
