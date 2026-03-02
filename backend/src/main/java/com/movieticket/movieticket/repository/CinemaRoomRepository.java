package com.movieticket.movieticket.repository;

import com.movieticket.movieticket.entity.CinemaRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CinemaRoomRepository extends JpaRepository<CinemaRoom, Long> {

    List<CinemaRoom> findByTheaterId(Long theaterId);

    boolean existsByTheaterIdAndName(Long theaterId, String name);
}
