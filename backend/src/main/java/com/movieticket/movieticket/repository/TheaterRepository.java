package com.movieticket.movieticket.repository;

import com.movieticket.movieticket.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheaterRepository extends JpaRepository<Theater, Long> {

    List<Theater> findByNameContainingIgnoreCase(String name);

    List<Theater> findByCityContainingIgnoreCase(String city);

    boolean existsByName(String name);
}
