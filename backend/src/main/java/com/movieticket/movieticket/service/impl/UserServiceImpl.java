package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.dto.UserProfileDto;
import com.movieticket.movieticket.entity.User;
import com.movieticket.movieticket.repository.UserRepository;
import com.movieticket.movieticket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserProfileDto getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    @Override
    @Transactional
    public UserProfileDto updateUserProfile(String username, UserProfileDto profileDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update allowed fields
        if (profileDto.getFullName() != null && !profileDto.getFullName().isBlank()) {
            user.setName(profileDto.getFullName());
        }
        if (profileDto.getEmail() != null && !profileDto.getEmail().isBlank()) {
            // Check if email already exists for another user
            if (!user.getEmail().equals(profileDto.getEmail()) &&
                    userRepository.existsByEmail(profileDto.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(profileDto.getEmail());
        }
        if (profileDto.getPhone() != null && !profileDto.getPhone().isBlank()) {
            // Check if phone already exists for another user
            if (!user.getPhone().equals(profileDto.getPhone()) &&
                    userRepository.existsByPhone(profileDto.getPhone())) {
                throw new RuntimeException("Phone already exists");
            }
            user.setPhone(profileDto.getPhone());
        }
        if (profileDto.getDateOfBirth() != null && !profileDto.getDateOfBirth().isBlank()) {
            try {
                user.setBirthDate(java.time.LocalDate.parse(profileDto.getDateOfBirth()));
            } catch (Exception e) {
                throw new RuntimeException("Invalid date format");
            }
        }
        if (profileDto.getAddress() != null) {
            user.setAddress(profileDto.getAddress());
        }
        if (profileDto.getAvatar() != null) {
            user.setAvatar(profileDto.getAvatar());
        }

        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserProfileDto convertToDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setCmnd(user.getCmnd());
        dto.setDateOfBirth(user.getBirthDate() != null ? user.getBirthDate().format(DateTimeFormatter.ISO_DATE) : null);
        dto.setAddress(user.getAddress());
        dto.setAvatar(user.getAvatar());
        dto.setRole(user.getRole().name());
        dto.setMembershipLevel(user.getMembershipLevel() != null ? user.getMembershipLevel().name() : null);
        dto.setPoints(user.getPoints());
        dto.setAccountBalance(user.getAccountBalance().toString());
        return dto;
    }
}
