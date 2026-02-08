package com.movieticket.movieticket.service;

import com.movieticket.movieticket.dto.BookingDto;
import com.movieticket.movieticket.dto.BookingRequest;

import java.util.List;

public interface BookingService {
    
    BookingDto createBooking(BookingRequest request, String username);
    
    List<BookingDto> getUserBookings(String username);
    
    BookingDto getBookingById(Long id, String username);
    
    BookingDto getBookingByTicketCode(String ticketCode, String username);
    
    void cancelBooking(Long id, String username);
}
