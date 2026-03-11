package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.dto.SeatDto;
import com.movieticket.movieticket.dto.ShowtimeDto;
import com.movieticket.movieticket.entity.CinemaRoom;
import com.movieticket.movieticket.entity.Movie;
import com.movieticket.movieticket.entity.Seat;
import com.movieticket.movieticket.entity.Showtime;
import com.movieticket.movieticket.entity.Theater;
import com.movieticket.movieticket.repository.BookingRepository;
import com.movieticket.movieticket.repository.CinemaRoomRepository;
import com.movieticket.movieticket.repository.MovieRepository;
import com.movieticket.movieticket.repository.SeatRepository;
import com.movieticket.movieticket.repository.ShowtimeRepository;
import com.movieticket.movieticket.repository.SystemSettingsRepository;
import com.movieticket.movieticket.repository.TheaterRepository;
import com.movieticket.movieticket.service.ShowtimeService;
import com.movieticket.movieticket.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;
    private final CinemaRoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final SystemSettingsRepository systemSettingsRepository;
    private final MovieService movieService;

    @Override
    public List<ShowtimeDto> getAllShowtimes() {
        return showtimeRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ShowtimeDto getShowtimeById(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found with id: " + id));
        return convertToDto(showtime);
    }

    @Override
    public List<ShowtimeDto> getShowtimesByMovieId(Long movieId) {
        return showtimeRepository.findByMovieId(movieId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShowtimeDto> getShowtimesByRoomId(Long roomId) {
        return showtimeRepository.findByRoomId(roomId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShowtimeDto> getShowtimesByMovieAndTheater(Long movieId, Long theaterId) {
        return showtimeRepository.findByMovieIdAndTheaterId(movieId, theaterId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShowtimeDto> getShowtimesByMovieAndDate(Long movieId, LocalDate date) {
        return showtimeRepository.findByMovieIdAndShowDate(movieId, date).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ShowtimeDto createShowtime(ShowtimeDto showtimeDto) {
        Movie movie = movieRepository.findById(showtimeDto.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + showtimeDto.getMovieId()));

        CinemaRoom room = roomRepository.findById(showtimeDto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Cinema room not found with id: " + showtimeDto.getRoomId()));

        Theater theater = room.getTheater();

        // Validate that showtime is not in the past
        LocalDateTime showtimeDateTime = LocalDateTime.of(showtimeDto.getShowDate(), showtimeDto.getShowTime());
        if (showtimeDateTime.isBefore(LocalDateTime.now()) || showtimeDateTime.isEqual(LocalDateTime.now())) {
            throw new RuntimeException("Ngày và giờ chiếu phải sau thời điểm hiện tại!");
        }

        // Validate showtime overlap (including cleanup time)
        validateShowtimeOverlap(
                room.getId(),
                showtimeDto.getShowDate(),
                showtimeDto.getShowTime(),
                movie.getDuration(),
                null // No exclusion for new showtime
        );

        // Get seat configuration from room
        int totalSeats = room.getTotalSeats();

        Showtime showtime = new Showtime();
        showtime.setMovie(movie);
        showtime.setTheater(theater);
        showtime.setRoom(room);
        showtime.setShowDate(showtimeDto.getShowDate());
        showtime.setShowTime(showtimeDto.getShowTime());
        showtime.setPrice(showtimeDto.getPrice());
        showtime.setAvailableSeats(totalSeats);
        showtime.setTotalSeats(totalSeats);

        Showtime savedShowtime = showtimeRepository.save(showtime);

        // Tự động tạo ghế cho suất chiếu
        initializeSeatsForShowtime(savedShowtime.getId());

        // Update movie status and release date after creating showtime
        movieService.updateMovieStatus(movie.getId());
        movieService.updateMovieReleaseDate(movie.getId());

        return convertToDto(savedShowtime);
    }

    @Override
    @Transactional
    public ShowtimeDto updateShowtime(Long id, ShowtimeDto showtimeDto) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found with id: " + id));

        // Validate that new showtime is not in the past (if date/time is being updated)
        LocalDate newDate = showtimeDto.getShowDate() != null ? showtimeDto.getShowDate() : showtime.getShowDate();
        LocalTime newTime = showtimeDto.getShowTime() != null ? showtimeDto.getShowTime() : showtime.getShowTime();
        LocalDateTime showtimeDateTime = LocalDateTime.of(newDate, newTime);
        if (showtimeDateTime.isBefore(LocalDateTime.now()) || showtimeDateTime.isEqual(LocalDateTime.now())) {
            throw new RuntimeException("Ngày và giờ chiếu phải sau thời điểm hiện tại!");
        }

        if (showtimeDto.getMovieId() != null && !showtimeDto.getMovieId().equals(showtime.getMovie().getId())) {
            Movie movie = movieRepository.findById(showtimeDto.getMovieId())
                    .orElseThrow(() -> new RuntimeException("Movie not found with id: " + showtimeDto.getMovieId()));
            showtime.setMovie(movie);
        }

        if (showtimeDto.getTheaterId() != null && !showtimeDto.getTheaterId().equals(showtime.getTheater().getId())) {
            Theater theater = theaterRepository.findById(showtimeDto.getTheaterId())
                    .orElseThrow(
                            () -> new RuntimeException("Theater not found with id: " + showtimeDto.getTheaterId()));
            showtime.setTheater(theater);
        }

        if (showtimeDto.getShowDate() != null) {
            showtime.setShowDate(showtimeDto.getShowDate());
        }
        if (showtimeDto.getShowTime() != null) {
            showtime.setShowTime(showtimeDto.getShowTime());
        }
        if (showtimeDto.getPrice() != null) {
            showtime.setPrice(showtimeDto.getPrice());
        }

        // Validate showtime overlap after updates (including cleanup time)
        validateShowtimeOverlap(
                showtime.getRoom().getId(),
                showtime.getShowDate(),
                showtime.getShowTime(),
                showtime.getMovie().getDuration(),
                id // Exclude current showtime from overlap check
        );

        Showtime updatedShowtime = showtimeRepository.save(showtime);

        // Update movie status and release date after updating showtime
        movieService.updateMovieStatus(showtime.getMovie().getId());
        movieService.updateMovieReleaseDate(showtime.getMovie().getId());

        return convertToDto(updatedShowtime);
    }

    @Override
    @Transactional
    public void deleteShowtime(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found with id: " + id));

        Long movieId = showtime.getMovie().getId();

        // Check if showtime has any bookings
        if (!bookingRepository.findByShowtimeId(id).isEmpty()) {
            throw new RuntimeException("Cannot delete showtime that has bookings. Bookings must be cancelled first.");
        }
        // Xóa tất cả ghế của suất chiếu trước
        seatRepository.deleteAll(seatRepository.findByShowtimeId(id));
        showtimeRepository.deleteById(id);

        // Update movie status and release date after deleting showtime
        movieService.updateMovieStatus(movieId);
        movieService.updateMovieReleaseDate(movieId);
    }

    @Override
    public List<SeatDto> getSeatsForShowtime(Long showtimeId) {
        if (!showtimeRepository.existsById(showtimeId)) {
            throw new RuntimeException("Showtime not found with id: " + showtimeId);
        }

        List<Seat> seats = seatRepository.findByShowtimeId(showtimeId);

        // Nếu chưa có ghế, tạo mới
        if (seats.isEmpty()) {
            initializeSeatsForShowtime(showtimeId);
            seats = seatRepository.findByShowtimeId(showtimeId);
        }

        return seats.stream()
                .map(this::convertSeatToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void initializeSeatsForShowtime(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found with id: " + showtimeId));

        // Check if seats already exist
        long existingSeatsCount = seatRepository.countByShowtimeId(showtimeId);
        if (existingSeatsCount > 0) {
            return; // Seats already initialized
        }

        // Get seat configuration from cinema room
        CinemaRoom room = showtime.getRoom();
        int totalRows = room.getTotalRows();
        int seatsPerRow = room.getTotalCols();

        List<Seat> seats = new ArrayList<>();

        // Generate row labels (A, B, C, ...)
        for (int i = 0; i < totalRows; i++) {
            String rowLabel = String.valueOf((char) ('A' + i));

            for (int col = 1; col <= seatsPerRow; col++) {
                Seat seat = new Seat();
                seat.setShowtime(showtime);
                seat.setSeatNumber(rowLabel + col);
                seat.setRowLabel(rowLabel);
                seat.setColumnNumber(col);
                seat.setStatus(Seat.SeatStatus.AVAILABLE);
                seats.add(seat);
            }
        }

        seatRepository.saveAll(seats);

        // Update showtime total seats
        showtime.setTotalSeats(seats.size());
        showtime.setAvailableSeats(seats.size());
        showtimeRepository.save(showtime);
    }

    /**
     * Check if the new showtime overlaps with existing showtimes in the same room
     * Considers movie duration + cleanup time (MIN_GAP_BETWEEN_SHOWS)
     */
    private void validateShowtimeOverlap(Long roomId, LocalDate showDate, LocalTime showTime,
            Integer movieDuration, Long excludeShowtimeId) {
        // Get MIN_GAP_BETWEEN_SHOWS from system settings
        int minGapMinutes = systemSettingsRepository.findBySettingKey("MIN_GAP_BETWEEN_SHOWS")
                .map(setting -> Integer.parseInt(setting.getSettingValue()))
                .orElse(30); // Default 30 minutes

        // Calculate end time: showTime + movie duration + cleanup time
        LocalTime newShowtimeEnd = showTime.plusMinutes(movieDuration + minGapMinutes);

        // Get all showtimes in the same room on the same date
        List<Showtime> existingShowtimes = showtimeRepository.findByRoomIdAndShowDate(roomId, showDate);

        // Check overlap with each existing showtime
        for (Showtime existing : existingShowtimes) {
            // Skip if checking the same showtime (for update case)
            if (excludeShowtimeId != null && existing.getId().equals(excludeShowtimeId)) {
                continue;
            }

            LocalTime existingStart = existing.getShowTime();
            LocalTime existingEnd = existingStart.plusMinutes(
                    existing.getMovie().getDuration() + minGapMinutes);

            // Check overlap: new showtime starts before existing ends AND new showtime ends
            // after existing starts
            boolean overlaps = showTime.isBefore(existingEnd) && newShowtimeEnd.isAfter(existingStart);

            if (overlaps) {
                String existingTimeRange = existingStart + " - " + existingEnd;
                String newTimeRange = showTime + " - " + newShowtimeEnd;
                String roomName = existing.getRoom().getName();
                String theaterName = existing.getTheater().getName();

                throw new RuntimeException(
                        String.format(
                                "Suất chiếu bị trùng lịch!\n\n" +
                                        "🏢 Rạp: %s\n" +
                                        "🎪 Phòng: %s\n" +
                                        "📅 Ngày: %s\n\n" +
                                        "❌ Suất chiếu đã có: %s\n" +
                                        "⚠️ Suất chiếu mới: %s\n\n" +
                                        "💡 Lưu ý: Đã tính thêm %d phút dọn phòng giữa các suất",
                                theaterName, roomName, showDate,
                                existingTimeRange, newTimeRange, minGapMinutes));
            }
        }
    }

    private ShowtimeDto convertToDto(Showtime showtime) {
        return ShowtimeDto.builder()
                .id(showtime.getId())
                .movieId(showtime.getMovie().getId())
                .movieTitle(showtime.getMovie().getTitle())
                .theaterId(showtime.getTheater().getId())
                .theaterName(showtime.getTheater().getName())
                .roomId(showtime.getRoom().getId())
                .roomName(showtime.getRoom().getName())
                .showDate(showtime.getShowDate())
                .showTime(showtime.getShowTime())
                .price(showtime.getPrice())
                .availableSeats(showtime.getAvailableSeats())
                .totalSeats(showtime.getTotalSeats())
                .build();
    }

    private SeatDto convertSeatToDto(Seat seat) {
        return SeatDto.builder()
                .id(seat.getId())
                .seatNumber(seat.getSeatNumber())
                .status(seat.getStatus().name())
                .showtimeId(seat.getShowtime().getId())
                .build();
    }
}
