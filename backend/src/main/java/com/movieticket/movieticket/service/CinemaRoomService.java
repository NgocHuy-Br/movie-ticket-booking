package com.movieticket.movieticket.service;

import com.movieticket.movieticket.dto.CinemaRoomDto;

import java.util.List;

public interface CinemaRoomService {

    List<CinemaRoomDto> getAllRooms();

    List<CinemaRoomDto> getRoomsByTheaterId(Long theaterId);

    CinemaRoomDto getRoomById(Long id);

    CinemaRoomDto createRoom(CinemaRoomDto roomDto);

    CinemaRoomDto updateRoom(Long id, CinemaRoomDto roomDto);

    void deleteRoom(Long id);
}
