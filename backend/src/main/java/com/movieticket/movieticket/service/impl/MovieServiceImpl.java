package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.dto.MovieDto;
import com.movieticket.movieticket.entity.Movie;
import com.movieticket.movieticket.repository.MovieRepository;
import com.movieticket.movieticket.repository.ShowtimeRepository;
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
    private final ShowtimeRepository showtimeRepository;

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
        movie.setDuration(movieDto.getDuration());
        movie.setGenre(movieDto.getGenre());
        movie.setAgeRating(movieDto.getAgeRating());
        movie.setPosterUrl(movieDto.getImageUrl());
        movie.setReleaseDate(movieDto.getReleaseDate());
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
        movie.setDuration(movieDto.getDuration());
        movie.setGenre(movieDto.getGenre());
        movie.setAgeRating(movieDto.getAgeRating());
        movie.setPosterUrl(movieDto.getImageUrl());
        movie.setReleaseDate(movieDto.getReleaseDate());
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
        // Check if movie has any showtimes
        if (!showtimeRepository.findByMovieId(id).isEmpty()) {
            throw new RuntimeException("Cannot delete movie that has showtimes. Please delete all showtimes first.");
        }
        movieRepository.deleteById(id);
    }

    private MovieDto convertToDto(Movie movie) {
        return MovieDto.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .duration(movie.getDuration())
                .genre(movie.getGenre())
                .ageRating(movie.getAgeRating())
                .imageUrl(movie.getPosterUrl())
                .releaseDate(movie.getReleaseDate())
                .status(movie.getStatus().name())
                .build();
    }
}
