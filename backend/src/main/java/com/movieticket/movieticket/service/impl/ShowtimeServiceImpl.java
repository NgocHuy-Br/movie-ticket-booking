package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.dto.SeatDto;
import com.movieticket.movieticket.dto.ShowtimeDto;
import com.movieticket.movieticket.entity.Movie;
import com.movieticket.movieticket.entity.Seat;
import com.movieticket.movieticket.entity.Showtime;
import com.movieticket.movieticket.entity.Theater;
import com.movieticket.movieticket.repository.BookingRepository;
import com.movieticket.movieticket.repository.MovieRepository;
import com.movieticket.movieticket.repository.SeatRepository;
import com.movieticket.movieticket.repository.ShowtimeRepository;
import com.movieticket.movieticket.repository.TheaterRepository;
import com.movieticket.movieticket.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;

    // Cấu hình sơ đồ ghế: 8 hàng (A-H), 10 cột (1-10)
    private static final String[] ROWS = { "A", "B", "C", "D", "E", "F", "G", "H" };
    private static final int COLS = 10;

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

        Theater theater = theaterRepository.findById(showtimeDto.getTheaterId())
                .orElseThrow(() -> new RuntimeException("Theater not found with id: " + showtimeDto.getTheaterId()));

        Showtime showtime = new Showtime();
        showtime.setMovie(movie);
        showtime.setTheater(theater);
        showtime.setShowDate(showtimeDto.getShowDate());
        showtime.setShowTime(showtimeDto.getShowTime());
        showtime.setPrice(showtimeDto.getPrice());
        showtime.setAvailableSeats(ROWS.length * COLS);
        showtime.setTotalSeats(ROWS.length * COLS);

        Showtime savedShowtime = showtimeRepository.save(showtime);

        // Tự động tạo ghế cho suất chiếu
        initializeSeatsForShowtime(savedShowtime.getId());

        return convertToDto(savedShowtime);
    }

    @Override
    @Transactional
    public ShowtimeDto updateShowtime(Long id, ShowtimeDto showtimeDto) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found with id: " + id));

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

        Showtime updatedShowtime = showtimeRepository.save(showtime);
        return convertToDto(updatedShowtime);
    }

    @Override
    @Transactional
    public void deleteShowtime(Long id) {
        if (!showtimeRepository.existsById(id)) {
            throw new RuntimeException("Showtime not found with id: " + id);
        }
        // Check if showtime has any bookings
        if (!bookingRepository.findByShowtimeId(id).isEmpty()) {
            throw new RuntimeException("Cannot delete showtime that has bookings. Bookings must be cancelled first.");
        }
        // Xóa tất cả ghế của suất chiếu trước
        seatRepository.deleteAll(seatRepository.findByShowtimeId(id));
        showtimeRepository.deleteById(id);
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

        List<Seat> seats = new ArrayList<>();

        for (String row : ROWS) {
            for (int col = 1; col <= COLS; col++) {
                Seat seat = new Seat();
                seat.setShowtime(showtime);
                seat.setSeatNumber(row + col);
                seat.setRowLabel(row);
                seat.setColumnNumber(col);
                seat.setStatus(Seat.SeatStatus.AVAILABLE);
                seats.add(seat);
            }
        }

        seatRepository.saveAll(seats);
    }

    private ShowtimeDto convertToDto(Showtime showtime) {
        return ShowtimeDto.builder()
                .id(showtime.getId())
                .movieId(showtime.getMovie().getId())
                .movieTitle(showtime.getMovie().getTitle())
                .theaterId(showtime.getTheater().getId())
                .theaterName(showtime.getTheater().getName())
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
