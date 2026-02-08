package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.dto.MovieDto;
import com.movieticket.movieticket.entity.Movie;
import com.movieticket.movieticket.repository.MovieRepository;
import com.movieticket.movieticket.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;

    @Override
    public List<MovieDto> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MovieDto> getNowShowingMovies() {
        return movieRepository.findByStatus(Movie.MovieStatus.NOW_SHOWING).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public MovieDto getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + id));
        return convertToDto(movie);
    }

    @Override
    @Transactional
    public MovieDto createMovie(MovieDto movieDto) {
        if (movieRepository.existsByTitle(movieDto.getTitle())) {
            throw new RuntimeException("Movie with title already exists: " + movieDto.getTitle());
        }

        Movie movie = new Movie();
        movie.setTitle(movieDto.getTitle());
        movie.setDescription(movieDto.getDescription());
        movie.setPosterUrl(movieDto.getImageUrl());
        movie.setAgeRating(movieDto.getAgeRating());
        movie.setDuration(movieDto.getDuration());
        movie.setStatus(Movie.MovieStatus.valueOf(movieDto.getStatus()));

        Movie savedMovie = movieRepository.save(movie);
        return convertToDto(savedMovie);
    }

    @Override
    @Transactional
    public MovieDto updateMovie(Long id, MovieDto movieDto) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + id));

        if (!movie.getTitle().equals(movieDto.getTitle()) &&
                movieRepository.existsByTitle(movieDto.getTitle())) {
            throw new RuntimeException("Movie with title already exists: " + movieDto.getTitle());
        }

        movie.setTitle(movieDto.getTitle());
        movie.setDescription(movieDto.getDescription());
        movie.setPosterUrl(movieDto.getImageUrl());
        movie.setAgeRating(movieDto.getAgeRating());
        movie.setDuration(movieDto.getDuration());
        movie.setStatus(Movie.MovieStatus.valueOf(movieDto.getStatus()));

        Movie updatedMovie = movieRepository.save(movie);
        return convertToDto(updatedMovie);
    }

    @Override
    @Transactional
    public void deleteMovie(Long id) {
        if (!movieRepository.existsById(id)) {
            throw new RuntimeException("Movie not found with id: " + id);
        }
        movieRepository.deleteById(id);
    }

    private MovieDto convertToDto(Movie movie) {
        return MovieDto.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .imageUrl(movie.getPosterUrl())
                .ageRating(movie.getAgeRating())
                .duration(movie.getDuration())
                .status(movie.getStatus().name())
                .build();
    }
}
