package com.movieticket.movieticket.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String name;

    @Email(message = "Email không hợp lệ")
    private String email;

    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải là 10 chữ số, bắt đầu bằng 0")
    private String phone;

    private String address;
    private LocalDate birthDate;
    private String avatar;
}
