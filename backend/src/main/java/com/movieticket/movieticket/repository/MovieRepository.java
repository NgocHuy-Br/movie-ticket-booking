package com.movieticket.movieticket.repository;

import com.movieticket.movieticket.entity.Movie;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    List<Movie> findByStatus(Movie.MovieStatus status);

    List<Movie> findByTitleContainingIgnoreCase(String title);

    boolean existsByTitle(String title);

    // Hot movies: Top phim được đặt vé nhiều nhất, không bao gồm ENDED
    @Query("SELECT m FROM Movie m " +
            "LEFT JOIN Booking b ON b.showtime.movie.id = m.id " +
            "WHERE m.status <> 'ENDED' " +
            "GROUP BY m.id " +
            "ORDER BY COUNT(b.id) DESC, m.releaseDate DESC")
    List<Movie> findHotMovies(Pageable pageable);

    // New movies: Phim mới nhất (theo release date), không bao gồm ENDED
    @Query("SELECT m FROM Movie m " +
            "WHERE m.status <> 'ENDED' " +
            "ORDER BY m.releaseDate DESC, m.createdAt DESC")
    List<Movie> findNewMovies(Pageable pageable);

    // Filter movies by search term, genre and status with sorting (including
    // booking count)
    @Query("SELECT m FROM Movie m " +
            "LEFT JOIN Booking b ON b.showtime.movie.id = m.id " +
            "WHERE (:search IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:genre IS NULL OR m.genre LIKE %:genre%) " +
            "AND (:status IS NULL OR m.status = :status) " +
            "GROUP BY m.id " +
            "ORDER BY " +
            "CASE WHEN :sortBy = 'bookingCount' THEN COUNT(b.id) END DESC, " +
            "CASE WHEN :sortBy = 'releaseDate' THEN m.releaseDate END DESC, " +
            "CASE WHEN :sortBy = 'title' THEN m.title END ASC")
    List<Movie> findMoviesWithFilters(@Param("search") String search,
            @Param("genre") String genre,
            @Param("status") Movie.MovieStatus status,
            @Param("sortBy") String sortBy,
            Pageable pageable);

    // Count for pagination
    @Query("SELECT COUNT(m) FROM Movie m " +
            "WHERE (:search IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:genre IS NULL OR m.genre LIKE %:genre%) " +
            "AND (:status IS NULL OR m.status = :status)")
    long countMoviesWithFilters(@Param("search") String search,
            @Param("genre") String genre,
            @Param("status") Movie.MovieStatus status);
}
