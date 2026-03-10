package com.movieticket.movieticket.controller;

import com.movieticket.movieticket.dto.ApiResponse;
import com.movieticket.movieticket.dto.AuthResponse;
import com.movieticket.movieticket.dto.ForgotPasswordRequest;
import com.movieticket.movieticket.dto.LoginRequest;
import com.movieticket.movieticket.dto.RegisterRequest;
import com.movieticket.movieticket.dto.ResetPasswordRequest;
import com.movieticket.movieticket.entity.User;
import com.movieticket.movieticket.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Tên đăng nhập hoặc mật khẩu không đúng"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> getCurrentUser() {
        try {
            User user = authService.getCurrentUser();
            AuthResponse.UserInfo userInfo = authService.getUserInfo(user);
            return ResponseEntity.ok(ApiResponse.success(userInfo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password/validate")
    public ResponseEntity<ApiResponse<Void>> validateForgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.validateForgotPassword(request);
            return ResponseEntity.ok(ApiResponse.success("Thông tin hợp lệ. Mã OTP đã được gửi", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
