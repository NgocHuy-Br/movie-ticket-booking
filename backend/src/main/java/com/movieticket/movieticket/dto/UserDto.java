package com.movieticket.movieticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String cmnd;
    private String name;
    private LocalDate birthDate;
    private String phone;
    private String address;
    private String email;
    private String username;
    private String avatar;
    private String role; // USER, ADMIN
    private String membershipLevel; // NORMAL, GOLD, PLATINUM
    private Integer points;
    private BigDecimal accountBalance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
