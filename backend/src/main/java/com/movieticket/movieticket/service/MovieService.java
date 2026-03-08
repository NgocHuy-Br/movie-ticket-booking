package com.movieticket.movieticket.service;

import com.movieticket.movieticket.dto.MovieDto;

import java.util.List;
import java.util.Map;

public interface MovieService {

    List<MovieDto> getAllMovies();

    List<MovieDto> getNowShowingMovies();

    // Hot movies: Top phim được đặt vé nhiều nhất (5 phim)
    List<MovieDto> getHotMovies(int limit);

    // New movies: Phim mới nhất (5 phim)
    List<MovieDto> getNewMovies(int limit);

    // Filtered movies: Lọc theo search, genre, status, sort by (pageable)
    Map<String, Object> getFilteredMovies(String search, String genre, String status, String sortBy, int page,
            int size);

    MovieDto getMovieById(Long id);

    MovieDto createMovie(MovieDto movieDto);

    MovieDto updateMovie(Long id, MovieDto movieDto);

    void deleteMovie(Long id);

    void updateAllMovieStatuses();

    void updateMovieStatus(Long movieId);
}
