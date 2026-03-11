package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.dto.CinemaRoomDto;
import com.movieticket.movieticket.entity.CinemaRoom;
import com.movieticket.movieticket.entity.Theater;
import com.movieticket.movieticket.repository.CinemaRoomRepository;
import com.movieticket.movieticket.repository.ShowtimeRepository;
import com.movieticket.movieticket.repository.TheaterRepository;
import com.movieticket.movieticket.service.CinemaRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CinemaRoomServiceImpl implements CinemaRoomService {

    private final CinemaRoomRepository roomRepository;
    private final TheaterRepository theaterRepository;
    private final ShowtimeRepository showtimeRepository;

    @Override
    public List<CinemaRoomDto> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CinemaRoomDto> getRoomsByTheaterId(Long theaterId) {
        return roomRepository.findByTheaterId(theaterId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CinemaRoomDto getRoomById(Long id) {
        CinemaRoom room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cinema room not found with id: " + id));
        return convertToDto(room);
    }

    @Override
    @Transactional
    public CinemaRoomDto createRoom(CinemaRoomDto roomDto) {
        Theater theater = theaterRepository.findById(roomDto.getTheaterId())
                .orElseThrow(() -> new RuntimeException("Theater not found with id: " + roomDto.getTheaterId()));

        // Check if room name already exists in this theater
        if (roomRepository.existsByTheaterIdAndName(roomDto.getTheaterId(), roomDto.getName())) {
            throw new RuntimeException("Room with name '" + roomDto.getName() + "' already exists in this theater");
        }

        CinemaRoom room = new CinemaRoom();
        room.setTheater(theater);
        room.setName(roomDto.getName());
        room.setTotalRows(roomDto.getTotalRows());
        room.setTotalCols(roomDto.getTotalCols());

        CinemaRoom savedRoom = roomRepository.save(room);
        return convertToDto(savedRoom);
    }

    @Override
    @Transactional
    public CinemaRoomDto updateRoom(Long id, CinemaRoomDto roomDto) {
        CinemaRoom room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cinema room not found with id: " + id));

        // Check if room has any showtimes
        if (showtimeRepository.existsByRoomId(id)) {
            throw new RuntimeException("Không thể chỉnh sửa phòng chiếu đã có suất chiếu!");
        }

        if (roomDto.getName() != null && !roomDto.getName().equals(room.getName())) {
            if (roomRepository.existsByTheaterIdAndName(room.getTheater().getId(), roomDto.getName())) {
                throw new RuntimeException("Room with name '" + roomDto.getName() + "' already exists in this theater");
            }
            room.setName(roomDto.getName());
        }

        if (roomDto.getTotalRows() != null) {
            room.setTotalRows(roomDto.getTotalRows());
        }

        if (roomDto.getTotalCols() != null) {
            room.setTotalCols(roomDto.getTotalCols());
        }

        CinemaRoom updatedRoom = roomRepository.save(room);
        return convertToDto(updatedRoom);
    }

    @Override
    @Transactional
    public void deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new RuntimeException("Cinema room not found with id: " + id);
        }
        // Check if room has any showtimes
        if (showtimeRepository.existsByRoomId(id)) {
            throw new RuntimeException(
                    "Không thể xóa phòng chiếu đã có suất chiếu. Vui lòng xóa tất cả suất chiếu liên quan trước!");
        }
        roomRepository.deleteById(id);
    }

    private CinemaRoomDto convertToDto(CinemaRoom room) {
        return CinemaRoomDto.builder()
                .id(room.getId())
                .theaterId(room.getTheater().getId())
                .theaterName(room.getTheater().getName())
                .name(room.getName())
                .totalRows(room.getTotalRows())
                .totalCols(room.getTotalCols())
                .totalSeats(room.getTotalSeats())
                .build();
    }
}
