package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.config.JwtTokenProvider;
import com.movieticket.movieticket.dto.AuthResponse;
import com.movieticket.movieticket.dto.ForgotPasswordRequest;
import com.movieticket.movieticket.dto.LoginRequest;
import com.movieticket.movieticket.dto.RegisterRequest;
import com.movieticket.movieticket.dto.ResetPasswordRequest;
import com.movieticket.movieticket.entity.User;
import com.movieticket.movieticket.repository.UserRepository;
import com.movieticket.movieticket.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate unique fields
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()
                && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        if (userRepository.existsByCmnd(request.getCmnd())) {
            throw new RuntimeException("CMND/CCCD đã tồn tại");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }

        // Create new user
        User user = new User();
        user.setCmnd(request.getCmnd());
        user.setName(request.getFullName());
        user.setBirthDate(request.getDateOfBirth());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        user.setMembershipLevel(User.MembershipLevel.NORMAL);
        user.setPoints(0);
        user.setAccountBalance(BigDecimal.ZERO);

        userRepository.save(user);

        // Auto login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .userInfo(getUserInfo(user))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .userInfo(getUserInfo(user))
                .build();
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public AuthResponse.UserInfo getUserInfo(User user) {
        return AuthResponse.UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .fullName(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .dateOfBirth(user.getBirthDate() != null ? user.getBirthDate().toString() : null)
                .avatar(user.getAvatar())
                .role(user.getRole().name())
                .membershipLevel(user.getMembershipLevel() != null ? user.getMembershipLevel().name() : null)
                .accountBalance(user.getAccountBalance())
                .build();
    }

    @Override
    public boolean validateForgotPassword(ForgotPasswordRequest request) {
        // Kiểm tra tên đăng nhập có tồn tại không
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Tên đăng nhập không tồn tại trong hệ thống"));

        // Kiểm tra email có khớp với tài khoản không
        if (user.getEmail() == null || !user.getEmail().equalsIgnoreCase(request.getEmail())) {
            throw new RuntimeException("Email không trùng khớp với tên đăng nhập này");
        }

        return true;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Tên đăng nhập không tồn tại"));

        // Mã hóa mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
