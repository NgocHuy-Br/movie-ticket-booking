package com.movieticket.movieticket.repository;

import com.movieticket.movieticket.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByShowtimeId(Long showtimeId);

    long countByShowtimeId(Long showtimeId);

    Optional<Seat> findByShowtimeIdAndSeatNumber(Long showtimeId, String seatNumber);

    List<Seat> findByShowtimeIdAndStatus(Long showtimeId, Seat.SeatStatus status);
}
