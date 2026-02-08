package com.movieticket.movieticket.service;

import com.movieticket.movieticket.dto.MovieDto;
import com.movieticket.movieticket.entity.Movie;

import java.util.List;

public interface MovieService {

    List<MovieDto> getAllMovies();

    List<MovieDto> getNowShowingMovies();

    MovieDto getMovieById(Long id);

    MovieDto createMovie(MovieDto movieDto);

    MovieDto updateMovie(Long id, MovieDto movieDto);

    void deleteMovie(Long id);
}
