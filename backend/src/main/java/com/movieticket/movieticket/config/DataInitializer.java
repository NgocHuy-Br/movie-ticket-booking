package com.movieticket.movieticket.config;

import com.movieticket.movieticket.entity.User;
import com.movieticket.movieticket.repository.UserRepository;
import com.movieticket.movieticket.service.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SystemSettingsService systemSettingsService;

    @Override
    public void run(String... args) {
        // Kiểm tra xem đã có admin chưa
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(user -> user.getRole() == User.Role.ADMIN);

        if (!adminExists) {
            log.info("Khong tim thay tai khoan admin. Dang tao tai khoan admin mac dinh...");

            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setName("Administrator");
            admin.setEmail("admin@movieticket.com");
            admin.setCmnd("000000000000");
            admin.setPhone("0000000000");
            admin.setBirthDate(LocalDate.of(1990, 1, 1));
            admin.setAddress("System");
            admin.setRole(User.Role.ADMIN);
            admin.setMembershipLevel(null); // Admin không có hạng thành viên
            admin.setPoints(0);
            admin.setAccountBalance(BigDecimal.ZERO);

            userRepository.save(admin);

            log.info("==============================================");
            log.info("  Da tao tai khoan admin mac dinh:");
            log.info("     Username: admin");
            log.info("     Password: admin");
            log.info("  Vui long doi mat khau sau khi dang nhap!");
            log.info("==============================================");
        } else {
            log.info("Tai khoan admin da ton tai.");
        }

        // Khởi tạo system settings mặc định
        log.info("Dang kiem tra va khoi tao system settings...");
        systemSettingsService.initializeDefaultSettings();
        log.info("System settings da duoc khoi tao thanh cong.");
    }
}
