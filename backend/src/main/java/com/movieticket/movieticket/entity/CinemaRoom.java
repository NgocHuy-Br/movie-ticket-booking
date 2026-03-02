package com.movieticket.movieticket.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cinema_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CinemaRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "total_rows", nullable = false)
    private Integer totalRows;

    @Column(name = "total_cols", nullable = false)
    private Integer totalCols;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Integer getTotalSeats() {
        return totalRows * totalCols;
    }
}
