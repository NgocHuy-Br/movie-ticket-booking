package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.dto.GenreDto;
import com.movieticket.movieticket.entity.Genre;
import com.movieticket.movieticket.repository.GenreRepository;
import com.movieticket.movieticket.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;

    @Override
    public List<GenreDto> getAllGenres() {
        return genreRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<GenreDto> getActiveGenres() {
        return genreRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public GenreDto getGenreById(Long id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Genre not found with id: " + id));
        return convertToDto(genre);
    }

    @Override
    public GenreDto createGenre(GenreDto genreDto) {
        if (genreRepository.existsByName(genreDto.getName())) {
            throw new RuntimeException("Genre with name '" + genreDto.getName() + "' already exists");
        }

        Genre genre = Genre.builder()
                .name(genreDto.getName())
                .description(genreDto.getDescription())
                .build();

        Genre saved = genreRepository.save(genre);
        return convertToDto(saved);
    }

    @Override
    public GenreDto updateGenre(Long id, GenreDto genreDto) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Genre not found with id: " + id));

        // Check if name is being changed and already exists
        if (!genre.getName().equals(genreDto.getName()) &&
                genreRepository.existsByName(genreDto.getName())) {
            throw new RuntimeException("Genre with name '" + genreDto.getName() + "' already exists");
        }

        genre.setName(genreDto.getName());
        genre.setDescription(genreDto.getDescription());

        Genre updated = genreRepository.save(genre);
        return convertToDto(updated);
    }

    @Override
    public void deleteGenre(Long id) {
        if (!genreRepository.existsById(id)) {
            throw new RuntimeException("Genre not found with id: " + id);
        }

        // Note: You might want to check if any movies are using this genre
        // before allowing deletion, or handle it with cascade/set null

        genreRepository.deleteById(id);
    }

    private GenreDto convertToDto(Genre genre) {
        return GenreDto.builder()
                .id(genre.getId())
                .name(genre.getName())
                .description(genre.getDescription())
                .build();
    }
}
