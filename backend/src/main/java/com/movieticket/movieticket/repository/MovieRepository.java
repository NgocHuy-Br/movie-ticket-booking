package com.movieticket.movieticket.repository;

import com.movieticket.movieticket.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    
    List<Movie> findByStatus(Movie.MovieStatus status);
    
    List<Movie> findByTitleContainingIgnoreCase(String title);
    
    boolean existsByTitle(String title);
}
