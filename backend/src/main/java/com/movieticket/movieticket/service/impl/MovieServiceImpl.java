package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.dto.MovieDto;
import com.movieticket.movieticket.entity.Movie;
import com.movieticket.movieticket.entity.Showtime;
import com.movieticket.movieticket.repository.MovieRepository;
import com.movieticket.movieticket.repository.ShowtimeRepository;
import com.movieticket.movieticket.repository.SystemSettingsRepository;
import com.movieticket.movieticket.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SystemSettingsRepository systemSettingsRepository;

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
        // Release date will be auto-calculated from showtimes
        movie.setReleaseDate(null);

        // Set status: default to COMING_SOON if not specified, otherwise use provided
        // status
        if (movieDto.getStatus() != null && !movieDto.getStatus().isEmpty()) {
            movie.setStatus(Movie.MovieStatus.valueOf(movieDto.getStatus()));
        } else {
            movie.setStatus(Movie.MovieStatus.COMING_SOON);
        }

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

        Movie.MovieStatus newStatus = Movie.MovieStatus.valueOf(movieDto.getStatus());
        Movie.MovieStatus currentStatus = movie.getStatus();

        // Validate status changes
        // Only allow manual change TO ENDED, not FROM ENDED or TO
        // COMING_SOON/NOW_SHOWING
        if (newStatus != currentStatus) {
            // Prevent manual change TO COMING_SOON or NOW_SHOWING
            if (newStatus == Movie.MovieStatus.COMING_SOON || newStatus == Movie.MovieStatus.NOW_SHOWING) {
                throw new RuntimeException(
                        "Không thể thay đổi trạng thái thủ công!\n" +
                                "➢ 'Sắp chiếu' và 'Đang chiếu' được cập nhật tự động dựa vào suất chiếu.\n" +
                                "➢ Bạn chỉ có thể đánh dấu phim 'Đã rời rạp' khi đầy đủ điều kiện.");
            }

            // Prevent manual change FROM ENDED
            if (currentStatus == Movie.MovieStatus.ENDED) {
                throw new RuntimeException(
                        "Không thể chuyển phim đã rời rạp về trạng thái khác!\n" +
                                "Phim đã được đánh dấu kết thúc.");
            }

            // Allow change TO ENDED (with validation)
            if (newStatus == Movie.MovieStatus.ENDED) {
                // Check if all showtimes have ended
                List<Showtime> showtimes = showtimeRepository.findByMovieId(id);
                LocalDateTime now = LocalDateTime.now();

                boolean hasActiveShowtimes = showtimes.stream().anyMatch(showtime -> {
                    LocalDateTime showtimeEnd = LocalDateTime.of(
                            showtime.getShowDate(),
                            showtime.getShowTime()).plusMinutes(movie.getDuration());
                    return showtimeEnd.isAfter(now);
                });

                if (hasActiveShowtimes) {
                    throw new RuntimeException(
                            "Không thể đánh dấu phim đã rời rạp!\n" +
                                    "Vẫn còn suất chiếu chưa kết thúc.\n" +
                                    "Vui lòng đợi tất cả suất chiếu kết thúc hoặc xóa các suất chiếu tương lai.");
                }
            }
        }

        movie.setTitle(movieDto.getTitle());
        movie.setDescription(movieDto.getDescription());
        movie.setDuration(movieDto.getDuration());
        movie.setGenre(movieDto.getGenre());
        movie.setAgeRating(movieDto.getAgeRating());
        movie.setPosterUrl(movieDto.getImageUrl());
        // Release date is auto-calculated from showtimes, not updated here
        movie.setStatus(newStatus);

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

    @Override
    @Transactional
    public void updateAllMovieStatuses() {
        List<Movie> movies = movieRepository.findAll();
        for (Movie movie : movies) {
            updateMovieStatus(movie.getId());
        }
    }

    @Override
    @Transactional
    public void updateMovieStatus(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + movieId));

        List<Showtime> showtimes = showtimeRepository.findByMovieId(movieId);

        if (showtimes.isEmpty()) {
            // No showtimes: set to COMING_SOON
            if (movie.getStatus() != Movie.MovieStatus.COMING_SOON) {
                movie.setStatus(Movie.MovieStatus.COMING_SOON);
                movieRepository.save(movie);
            }
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        // Check if any showtime has started (showDate + showTime < now)
        boolean hasStartedShowtime = showtimes.stream().anyMatch(showtime -> {
            LocalDateTime showtimeStart = LocalDateTime.of(
                    showtime.getShowDate(),
                    showtime.getShowTime());
            return showtimeStart.isBefore(now);
        });

        // Find the last showtime end (showDate + showTime + duration)
        LocalDateTime lastShowtimeEnd = showtimes.stream()
                .map(showtime -> LocalDateTime.of(
                        showtime.getShowDate(),
                        showtime.getShowTime()).plusMinutes(movie.getDuration()))
                .max(LocalDateTime::compareTo)
                .orElse(null);

        if (hasStartedShowtime) {
            // At least one showtime has started -> NOW_SHOWING
            if (movie.getStatus() != Movie.MovieStatus.NOW_SHOWING) {
                movie.setStatus(Movie.MovieStatus.NOW_SHOWING);
                movieRepository.save(movie);
            }

            // Check if should auto-mark as ENDED
            if (lastShowtimeEnd != null) {
                int autoMarkDays = systemSettingsRepository.findBySettingKey("AUTO_MARK_ENDED_AFTER_DAYS")
                        .map(setting -> Integer.parseInt(setting.getSettingValue()))
                        .orElse(7);

                LocalDateTime autoEndDate = lastShowtimeEnd.plusDays(autoMarkDays);
                if (now.isAfter(autoEndDate)) {
                    movie.setStatus(Movie.MovieStatus.ENDED);
                    movieRepository.save(movie);
                }
            }
        } else {
            // All showtimes are in the future -> COMING_SOON
            if (movie.getStatus() != Movie.MovieStatus.COMING_SOON &&
                    movie.getStatus() != Movie.MovieStatus.ENDED) {
                movie.setStatus(Movie.MovieStatus.COMING_SOON);
                movieRepository.save(movie);
            }
        }
    }

    @Override
    public List<MovieDto> getHotMovies(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return movieRepository.findHotMovies(pageable).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MovieDto> getNewMovies(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return movieRepository.findNewMovies(pageable).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getFilteredMovies(String search, String genre, String status, String sortBy, int page,
            int size) {
        // Default values
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "releaseDate";
        }

        Movie.MovieStatus movieStatus = null;
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                movieStatus = Movie.MovieStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                movieStatus = null;
            }
        }

        String searchTerm = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String genreFilter = (genre != null && !genre.isEmpty() && !genre.equalsIgnoreCase("ALL")) ? genre : null;

        Pageable pageable = PageRequest.of(page, size);
        List<Movie> movies = movieRepository.findMoviesWithFilters(searchTerm, genreFilter, movieStatus, sortBy,
                pageable);
        long totalElements = movieRepository.countMoviesWithFilters(searchTerm, genreFilter, movieStatus);
        int totalPages = (int) Math.ceil((double) totalElements / size);

        Map<String, Object> response = new HashMap<>();
        response.put("movies", movies.stream().map(this::convertToDto).collect(Collectors.toList()));
        response.put("currentPage", page);
        response.put("totalPages", totalPages);
        response.put("totalElements", totalElements);

        return response;
    }

    @Override
    @Transactional
    public void updateMovieReleaseDate(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + movieId));

        // Get the earliest showtime date for this movie
        java.time.LocalDate earliestShowDate = showtimeRepository.findEarliestShowDateByMovieId(movieId);

        // Update movie's release date (null if no showtimes exist)
        movie.setReleaseDate(earliestShowDate);
        movieRepository.save(movie);
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
