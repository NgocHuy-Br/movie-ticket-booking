package com.movieticket.movieticket.service;

import com.movieticket.movieticket.dto.AuthResponse;
import com.movieticket.movieticket.dto.LoginRequest;
import com.movieticket.movieticket.dto.RegisterRequest;
import com.movieticket.movieticket.entity.User;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    User getCurrentUser();

    AuthResponse.UserInfo getUserInfo(User user);
}
