package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.dto.TheaterDto;
import com.movieticket.movieticket.entity.Theater;
import com.movieticket.movieticket.repository.TheaterRepository;
import com.movieticket.movieticket.service.TheaterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TheaterServiceImpl implements TheaterService {

    private final TheaterRepository theaterRepository;

    @Override
    public List<TheaterDto> getAllTheaters() {
        return theaterRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TheaterDto getTheaterById(Long id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Theater not found with id: " + id));
        return convertToDto(theater);
    }

    @Override
    @Transactional
    public TheaterDto createTheater(TheaterDto theaterDto) {
        if (theaterRepository.existsByName(theaterDto.getName())) {
            throw new RuntimeException("Theater with name already exists: " + theaterDto.getName());
        }

        Theater theater = new Theater();
        theater.setName(theaterDto.getName());
        theater.setCity(theaterDto.getCity());
        theater.setAddress(theaterDto.getAddress());
        theater.setPhone(theaterDto.getPhone());
        theater.setTotalRooms(theaterDto.getTotalRooms());

        Theater savedTheater = theaterRepository.save(theater);
        return convertToDto(savedTheater);
    }

    @Override
    @Transactional
    public TheaterDto updateTheater(Long id, TheaterDto theaterDto) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Theater not found with id: " + id));

        if (!theater.getName().equals(theaterDto.getName()) &&
                theaterRepository.existsByName(theaterDto.getName())) {
            throw new RuntimeException("Theater with name already exists: " + theaterDto.getName());
        }

        theater.setName(theaterDto.getName());
        theater.setCity(theaterDto.getCity());
        theater.setAddress(theaterDto.getAddress());
        theater.setPhone(theaterDto.getPhone());
        theater.setTotalRooms(theaterDto.getTotalRooms());

        Theater updatedTheater = theaterRepository.save(theater);
        return convertToDto(updatedTheater);
    }

    @Override
    @Transactional
    public void deleteTheater(Long id) {
        if (!theaterRepository.existsById(id)) {
            throw new RuntimeException("Theater not found with id: " + id);
        }
        theaterRepository.deleteById(id);
    }

    private TheaterDto convertToDto(Theater theater) {
        return TheaterDto.builder()
                .id(theater.getId())
                .name(theater.getName())
                .city(theater.getCity())
                .address(theater.getAddress())
                .phone(theater.getPhone())
                .totalRooms(theater.getTotalRooms())
                .build();
    }
}
