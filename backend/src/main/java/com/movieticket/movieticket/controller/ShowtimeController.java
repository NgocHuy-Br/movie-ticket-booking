package com.movieticket.movieticket.controller;

import com.movieticket.movieticket.dto.ApiResponse;
import com.movieticket.movieticket.dto.SeatDto;
import com.movieticket.movieticket.dto.ShowtimeDto;
import com.movieticket.movieticket.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
        "http://localhost:3000" })
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShowtimeDto>>> getAllShowtimes(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long theaterId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<ShowtimeDto> showtimes;

        if (movieId != null && theaterId != null) {
            showtimes = showtimeService.getShowtimesByMovieAndTheater(movieId, theaterId);
        } else if (movieId != null && date != null) {
            showtimes = showtimeService.getShowtimesByMovieAndDate(movieId, date);
        } else if (movieId != null) {
            showtimes = showtimeService.getShowtimesByMovieId(movieId);
        } else if (roomId != null) {
            showtimes = showtimeService.getShowtimesByRoomId(roomId);
        } else {
            showtimes = showtimeService.getAllShowtimes();
        }

        return ResponseEntity.ok(ApiResponse.success("Get showtimes successfully", showtimes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeDto>> getShowtimeById(@PathVariable Long id) {
        try {
            ShowtimeDto showtime = showtimeService.getShowtimeById(id);
            return ResponseEntity.ok(ApiResponse.success("Get showtime successfully", showtime));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<ApiResponse<List<SeatDto>>> getSeatsForShowtime(@PathVariable Long id) {
        try {
            List<SeatDto> seats = showtimeService.getSeatsForShowtime(id);
            return ResponseEntity.ok(ApiResponse.success("Get seats successfully", seats));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/initialize-seats")
    public ResponseEntity<ApiResponse<String>> initializeSeatsForShowtime(@PathVariable Long id) {
        try {
            showtimeService.initializeSeatsForShowtime(id);
            return ResponseEntity
                    .ok(ApiResponse.success("Seats initialized successfully", "Seats have been created for showtime"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShowtimeDto>> createShowtime(@RequestBody ShowtimeDto showtimeDto) {
        try {
            ShowtimeDto createdShowtime = showtimeService.createShowtime(showtimeDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Showtime created successfully", createdShowtime));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeDto>> updateShowtime(
            @PathVariable Long id,
            @RequestBody ShowtimeDto showtimeDto) {
        try {
            ShowtimeDto updatedShowtime = showtimeService.updateShowtime(id, showtimeDto);
            return ResponseEntity.ok(ApiResponse.success("Showtime updated successfully", updatedShowtime));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteShowtime(@PathVariable Long id) {
        try {
            showtimeService.deleteShowtime(id);
            return ResponseEntity.ok(ApiResponse.success("Showtime deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
