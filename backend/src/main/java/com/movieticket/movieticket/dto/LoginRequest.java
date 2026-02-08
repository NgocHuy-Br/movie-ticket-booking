package com.movieticket.movieticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Username là bắt buộc")
    private String username;

    @NotBlank(message = "Mật khẩu là bắt buộc")
    private String password;
}
