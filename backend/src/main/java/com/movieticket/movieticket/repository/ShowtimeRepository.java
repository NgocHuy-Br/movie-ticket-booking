package com.movieticket.movieticket.repository;

import com.movieticket.movieticket.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    List<Showtime> findByMovieId(Long movieId);

    List<Showtime> findByTheaterId(Long theaterId);

    List<Showtime> findByRoomId(Long roomId);

    @Query("SELECT s FROM Showtime s WHERE s.movie.id = :movieId AND s.theater.id = :theaterId")
    List<Showtime> findByMovieIdAndTheaterId(@Param("movieId") Long movieId, @Param("theaterId") Long theaterId);

    @Query("SELECT s FROM Showtime s WHERE s.movie.id = :movieId AND s.showDate = :showDate")
    List<Showtime> findByMovieIdAndShowDate(@Param("movieId") Long movieId, @Param("showDate") LocalDate showDate);

    @Query("SELECT s FROM Showtime s WHERE s.movie.id = :movieId AND s.theater.id = :theaterId AND s.showDate = :showDate")
    List<Showtime> findByMovieIdAndTheaterIdAndShowDate(
            @Param("movieId") Long movieId,
            @Param("theaterId") Long theaterId,
            @Param("showDate") LocalDate showDate);
}
