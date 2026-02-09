package com.movieticket.movieticket.config;

import com.movieticket.movieticket.entity.User;
import com.movieticket.movieticket.repository.UserRepository;
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

    @Override
    public void run(String... args) {
        // Kiểm tra xem đã có admin chưa
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(user -> user.getRole() == User.Role.ADMIN);

        if (!adminExists) {
            log.info("Không tìm thấy tài khoản admin. Đang tạo tài khoản admin mặc định...");

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
            admin.setMembershipLevel(null);  // Admin không có hạng thành viên
            admin.setPoints(0);
            admin.setAccountBalance(BigDecimal.ZERO);

            userRepository.save(admin);

            log.info("✅ Đã tạo tài khoản admin mặc định:");
            log.info("   Username: admin");
            log.info("   Password: admin");
            log.info("   ⚠️ Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu!");
        } else {
            log.info("Tài khoản admin đã tồn tại.");
        }
    }
}
