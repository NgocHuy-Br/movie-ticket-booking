package com.movieticket.movieticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CinemaRoomDto {
    private Long id;
    private Long theaterId;
    private String theaterName;
    private String name;
    private Integer totalRows;
    private Integer totalCols;
    private Integer totalSeats;
}
