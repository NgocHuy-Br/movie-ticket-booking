package com.movieticket.movieticket.service;

import com.movieticket.movieticket.dto.TheaterDto;

import java.util.List;

public interface TheaterService {
    
    List<TheaterDto> getAllTheaters();
    
    TheaterDto getTheaterById(Long id);
    
    TheaterDto createTheater(TheaterDto theaterDto);
    
    TheaterDto updateTheater(Long id, TheaterDto theaterDto);
    
    void deleteTheater(Long id);
}
