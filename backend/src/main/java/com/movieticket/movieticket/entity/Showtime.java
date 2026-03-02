package com.movieticket.movieticket.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "showtimes", indexes = {
        @Index(name = "idx_show_date_time", columnList = "show_date, show_time"),
        @Index(name = "idx_movie_theater", columnList = "movie_id, theater_id"),
        @Index(name = "idx_room_date", columnList = "room_id, show_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Showtime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private CinemaRoom room;

    @Column(name = "show_date", nullable = false)
    private LocalDate showDate;

    @Column(name = "show_time", nullable = false)
    private LocalTime showTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(precision = 10, scale = 2)
    private BigDecimal price = new BigDecimal("85000.00");

    @Column(name = "available_seats")
    private Integer availableSeats = 80;

    @Column(name = "total_seats")
    private Integer totalSeats = 80;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShowtimeStatus status = ShowtimeStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ShowtimeStatus {
        ACTIVE, FULL, CANCELLED
    }
}
