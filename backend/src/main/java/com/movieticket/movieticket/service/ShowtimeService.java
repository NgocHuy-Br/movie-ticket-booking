package com.movieticket.movieticket.service;

import com.movieticket.movieticket.dto.ShowtimeDto;
import com.movieticket.movieticket.dto.SeatDto;

import java.time.LocalDate;
import java.util.List;

public interface ShowtimeService {

    List<ShowtimeDto> getAllShowtimes();

    ShowtimeDto getShowtimeById(Long id);

    List<ShowtimeDto> getShowtimesByMovieId(Long movieId);

    List<ShowtimeDto> getShowtimesByMovieAndTheater(Long movieId, Long theaterId);

    List<ShowtimeDto> getShowtimesByMovieAndDate(Long movieId, LocalDate date);

    ShowtimeDto createShowtime(ShowtimeDto showtimeDto);

    ShowtimeDto updateShowtime(Long id, ShowtimeDto showtimeDto);

    void deleteShowtime(Long id);

    List<SeatDto> getSeatsForShowtime(Long showtimeId);

    void initializeSeatsForShowtime(Long showtimeId);
}
