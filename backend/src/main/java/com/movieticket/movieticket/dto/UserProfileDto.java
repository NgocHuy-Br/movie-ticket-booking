package com.movieticket.movieticket.dto;

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
    private String email;
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
