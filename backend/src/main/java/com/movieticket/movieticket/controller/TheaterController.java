package com.movieticket.movieticket.controller;

import com.movieticket.movieticket.dto.ApiResponse;
import com.movieticket.movieticket.dto.TheaterDto;
import com.movieticket.movieticket.service.TheaterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theaters")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TheaterController {

    private final TheaterService theaterService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TheaterDto>>> getAllTheaters() {
        List<TheaterDto> theaters = theaterService.getAllTheaters();
        return ResponseEntity.ok(ApiResponse.success("Get all theaters successfully", theaters));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TheaterDto>> getTheaterById(@PathVariable Long id) {
        try {
            TheaterDto theater = theaterService.getTheaterById(id);
            return ResponseEntity.ok(ApiResponse.success("Get theater successfully", theater));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TheaterDto>> createTheater(@RequestBody TheaterDto theaterDto) {
        try {
            TheaterDto createdTheater = theaterService.createTheater(theaterDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Theater created successfully", createdTheater));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TheaterDto>> updateTheater(
            @PathVariable Long id,
            @RequestBody TheaterDto theaterDto) {
        try {
            TheaterDto updatedTheater = theaterService.updateTheater(id, theaterDto);
            return ResponseEntity.ok(ApiResponse.success("Theater updated successfully", updatedTheater));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTheater(@PathVariable Long id) {
        try {
            theaterService.deleteTheater(id);
            return ResponseEntity.ok(ApiResponse.success("Theater deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
