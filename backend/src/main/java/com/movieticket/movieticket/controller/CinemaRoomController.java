package com.movieticket.movieticket.controller;

import com.movieticket.movieticket.dto.ApiResponse;
import com.movieticket.movieticket.dto.CinemaRoomDto;
import com.movieticket.movieticket.service.CinemaRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class CinemaRoomController {

    private final CinemaRoomService roomService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CinemaRoomDto>>> getAllRooms(
            @RequestParam(required = false) Long theaterId) {
        List<CinemaRoomDto> rooms;

        if (theaterId != null) {
            rooms = roomService.getRoomsByTheaterId(theaterId);
        } else {
            rooms = roomService.getAllRooms();
        }

        return ResponseEntity.ok(ApiResponse.success("Get rooms successfully", rooms));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaRoomDto>> getRoomById(@PathVariable Long id) {
        try {
            CinemaRoomDto room = roomService.getRoomById(id);
            return ResponseEntity.ok(ApiResponse.success("Get room successfully", room));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CinemaRoomDto>> createRoom(@RequestBody CinemaRoomDto roomDto) {
        try {
            CinemaRoomDto createdRoom = roomService.createRoom(roomDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Room created successfully", createdRoom));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaRoomDto>> updateRoom(
            @PathVariable Long id,
            @RequestBody CinemaRoomDto roomDto) {
        try {
            CinemaRoomDto updatedRoom = roomService.updateRoom(id, roomDto);
            return ResponseEntity.ok(ApiResponse.success("Room updated successfully", updatedRoom));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        try {
            roomService.deleteRoom(id);
            return ResponseEntity.ok(ApiResponse.success("Room deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
