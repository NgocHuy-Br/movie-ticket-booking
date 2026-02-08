package com.movieticket.movieticket.repository;

import com.movieticket.movieticket.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Booking> findByTicketCode(String ticketCode);

    List<Booking> findByShowtimeId(Long showtimeId);

    List<Booking> findByUserIdAndStatus(Long userId, Booking.BookingStatus status);

    boolean existsByTicketCode(String ticketCode);
}
