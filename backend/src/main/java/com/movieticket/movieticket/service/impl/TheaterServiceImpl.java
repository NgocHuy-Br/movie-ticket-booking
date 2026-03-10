package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.dto.TheaterDto;
import com.movieticket.movieticket.entity.Theater;
import com.movieticket.movieticket.entity.CinemaRoom;
import com.movieticket.movieticket.repository.TheaterRepository;
import com.movieticket.movieticket.repository.ShowtimeRepository;
import com.movieticket.movieticket.repository.CinemaRoomRepository;
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
    private final ShowtimeRepository showtimeRepository;
    private final CinemaRoomRepository cinemaRoomRepository;

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
        theater.setDefaultRows(theaterDto.getDefaultRows());
        theater.setDefaultCols(theaterDto.getDefaultCols());

        Theater savedTheater = theaterRepository.save(theater);

        // Automatically create cinema rooms based on totalRooms
        createCinemaRooms(savedTheater, theaterDto.getTotalRooms());

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
        theater.setDefaultRows(theaterDto.getDefaultRows());
        theater.setDefaultCols(theaterDto.getDefaultCols());

        // Get current number of rooms before update
        int oldTotalRooms = theater.getTotalRooms();
        int newTotalRooms = theaterDto.getTotalRooms();
        theater.setTotalRooms(newTotalRooms);

        Theater updatedTheater = theaterRepository.save(theater);

        // Adjust cinema rooms if totalRooms changed
        if (oldTotalRooms != newTotalRooms) {
            adjustCinemaRooms(updatedTheater, oldTotalRooms, newTotalRooms);
        }

        return convertToDto(updatedTheater);
    }

    @Override
    @Transactional
    public void deleteTheater(Long id) {
        if (!theaterRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy rạp với id: " + id);
        }
        // Check if theater has any cinema rooms
        if (!cinemaRoomRepository.findByTheaterId(id).isEmpty()) {
            throw new RuntimeException(
                    "Không thể xóa vì rạp đã có phòng chiếu. Vui lòng xóa tất cả phòng chiếu liên quan trước");
        }
        // Check if theater has any showtimes
        if (!showtimeRepository.findByTheaterId(id).isEmpty()) {
            throw new RuntimeException(
                    "Không thể xóa vì rạp đã có suất chiếu. Vui lòng xóa tất cả suất chiếu liên quan trước");
        }
        theaterRepository.deleteById(id);
    }

    /**
     * Create cinema rooms automatically when creating a new theater
     * Uses theater's default rows and cols settings
     */
    private void createCinemaRooms(Theater theater, int totalRooms) {
        int defaultRows = theater.getDefaultRows() != null ? theater.getDefaultRows() : 10;
        int defaultCols = theater.getDefaultCols() != null ? theater.getDefaultCols() : 8;

        for (int i = 1; i <= totalRooms; i++) {
            CinemaRoom room = new CinemaRoom();
            room.setTheater(theater);
            room.setName(String.format("Phòng %02d", i));
            room.setTotalRows(defaultRows);
            room.setTotalCols(defaultCols);
            cinemaRoomRepository.save(room);
        }
    }

    /**
     * Adjust cinema rooms when updating theater's totalRooms
     */
    private void adjustCinemaRooms(Theater theater, int oldTotal, int newTotal) {
        if (newTotal > oldTotal) {
            // Add more rooms using theater's default settings
            int defaultRows = theater.getDefaultRows() != null ? theater.getDefaultRows() : 10;
            int defaultCols = theater.getDefaultCols() != null ? theater.getDefaultCols() : 8;

            for (int i = oldTotal + 1; i <= newTotal; i++) {
                CinemaRoom room = new CinemaRoom();
                room.setTheater(theater);
                room.setName(String.format("Phòng %02d", i));
                room.setTotalRows(defaultRows);
                room.setTotalCols(defaultCols);
                cinemaRoomRepository.save(room);
            }
        } else if (newTotal < oldTotal) {
            // Remove extra rooms (only if they have no showtimes)
            List<CinemaRoom> rooms = cinemaRoomRepository.findByTheaterId(theater.getId());

            // Sort by room name to delete from highest number
            rooms.sort((a, b) -> b.getName().compareTo(a.getName()));

            int roomsToDelete = oldTotal - newTotal;
            int deleted = 0;

            for (CinemaRoom room : rooms) {
                if (deleted >= roomsToDelete)
                    break;

                // Check if room has any showtimes
                if (showtimeRepository.findByRoomId(room.getId()).isEmpty()) {
                    cinemaRoomRepository.delete(room);
                    deleted++;
                } else {
                    throw new RuntimeException(
                            "Không thể giảm số phòng vì " + room.getName() +
                                    " đã có suất chiếu. Vui lòng xóa suất chiếu trước!");
                }
            }
        }
    }

    private TheaterDto convertToDto(Theater theater) {
        return TheaterDto.builder()
                .id(theater.getId())
                .name(theater.getName())
                .city(theater.getCity())
                .address(theater.getAddress())
                .phone(theater.getPhone())
                .totalRooms(theater.getTotalRooms())
                .defaultRows(theater.getDefaultRows())
                .defaultCols(theater.getDefaultCols())
                .build();
    }
}
