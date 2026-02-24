package com.movieticket.movieticket.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String username;
    private String fullName;

    @Email(message = "Email không hợp lệ")
    private String email;

    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải là 10 chữ số, bắt đầu bằng 0")
    private String phone;

    private String cmnd;
    private String dateOfBirth;
    private String address;
    private String avatar;
    private String role;
    private String membershipLevel;
    private Integer points;
    private String accountBalance;
}
