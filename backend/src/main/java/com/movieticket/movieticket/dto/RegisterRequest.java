package com.movieticket.movieticket.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "CMND/CCCD là bắt buộc")
    @Pattern(regexp = "^\\d{9,12}$", message = "CMND/CCCD phải là số từ 9-12 chữ số")
    private String cmnd;

    @NotBlank(message = "Tên là bắt buộc")
    private String fullName;

    @NotNull(message = "Ngày sinh là bắt buộc")
    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Số điện thoại là bắt buộc")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải là 10 chữ số, bắt đầu bằng 0")
    private String phone;

    @NotBlank(message = "Username là bắt buộc")
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu là bắt buộc")
    @Size(min = 6, message = "Mật khẩu phải ít nhất 6 ký tự")
    private String password;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String address;
}
