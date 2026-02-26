package com.movieticket.movieticket.service;

import com.movieticket.movieticket.dto.GenreDto;

import java.util.List;

public interface GenreService {
    List<GenreDto> getAllGenres();

    List<GenreDto> getActiveGenres();

    GenreDto getGenreById(Long id);

    GenreDto createGenre(GenreDto genreDto);

    GenreDto updateGenre(Long id, GenreDto genreDto);

    void deleteGenre(Long id);
}
