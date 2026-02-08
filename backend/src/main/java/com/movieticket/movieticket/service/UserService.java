package com.movieticket.movieticket.service;

import com.movieticket.movieticket.dto.UserProfileDto;

public interface UserService {

    UserProfileDto getUserProfile(String username);

    UserProfileDto updateUserProfile(String username, UserProfileDto profileDto);

    void changePassword(String username, String currentPassword, String newPassword);
}
