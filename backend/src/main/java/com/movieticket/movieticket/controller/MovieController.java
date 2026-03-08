package com.movieticket.movieticket.controller;

import com.movieticket.movieticket.dto.ApiResponse;
import com.movieticket.movieticket.dto.MovieDto;
import com.movieticket.movieticket.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
        "http://localhost:3000" })
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MovieDto>>> getAllMovies() {
        List<MovieDto> movies = movieService.getAllMovies();
        return ResponseEntity.ok(ApiResponse.success("Get all movies successfully", movies));
    }

    @GetMapping("/hot")
    public ResponseEntity<ApiResponse<List<MovieDto>>> getHotMovies(
            @RequestParam(defaultValue = "5") int limit) {
        List<MovieDto> movies = movieService.getHotMovies(limit);
        return ResponseEntity.ok(ApiResponse.success("Get hot movies successfully", movies));
    }

    @GetMapping("/new")
    public ResponseEntity<ApiResponse<List<MovieDto>>> getNewMovies(
            @RequestParam(defaultValue = "5") int limit) {
        List<MovieDto> movies = movieService.getNewMovies(limit);
        return ResponseEntity.ok(ApiResponse.success("Get new movies successfully", movies));
    }

    @GetMapping("/filtered")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getFilteredMovies(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "releaseDate") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        java.util.Map<String, Object> result = movieService.getFilteredMovies(search, genre, status, sortBy, page,
                size);
        return ResponseEntity.ok(ApiResponse.success("Get filtered movies successfully", result));
    }

    @GetMapping("/now-showing")
    public ResponseEntity<ApiResponse<List<MovieDto>>> getNowShowingMovies() {
        List<MovieDto> movies = movieService.getNowShowingMovies();
        return ResponseEntity.ok(ApiResponse.success("Get now showing movies successfully", movies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieDto>> getMovieById(@PathVariable Long id) {
        try {
            MovieDto movie = movieService.getMovieById(id);
            return ResponseEntity.ok(ApiResponse.success("Get movie successfully", movie));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MovieDto>> createMovie(@RequestBody MovieDto movieDto) {
        try {
            MovieDto createdMovie = movieService.createMovie(movieDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Movie created successfully", createdMovie));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieDto>> updateMovie(
            @PathVariable Long id,
            @RequestBody MovieDto movieDto) {
        try {
            MovieDto updatedMovie = movieService.updateMovie(id, movieDto);
            return ResponseEntity.ok(ApiResponse.success("Movie updated successfully", updatedMovie));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.ok(ApiResponse.success("Movie deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
