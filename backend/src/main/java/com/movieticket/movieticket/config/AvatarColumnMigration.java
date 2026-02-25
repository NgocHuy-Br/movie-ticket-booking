package com.movieticket.movieticket.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Migration script to fix avatar column size issue
 * This will run automatically on application startup
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(0) // Run before DataInitializer
public class AvatarColumnMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Checking avatar column type...");

            // Check current column type
            String currentType = jdbcTemplate.queryForObject(
                    "SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS " +
                            "WHERE TABLE_SCHEMA = DATABASE() " +
                            "AND TABLE_NAME = 'users' " +
                            "AND COLUMN_NAME = 'avatar'",
                    String.class);

            log.info("Current avatar column type: {}", currentType);

            // If not already LONGTEXT, migrate it
            if (!"longtext".equalsIgnoreCase(currentType)) {
                log.info("Migrating avatar column from {} to LONGTEXT...", currentType);
                jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN avatar LONGTEXT");
                log.info("==============================================");
                log.info("  SUCCESS! Avatar column migrated to LONGTEXT");
                log.info("  You can now upload large Base64 images");
                log.info("==============================================");
            } else {
                log.info("Avatar column is already LONGTEXT. No migration needed.");
            }

        } catch (Exception e) {
            log.error("Failed to migrate avatar column. Please run fix_avatar_column.sql manually.", e);
            log.error("See backend/URGENT_FIX_AVATAR.md for instructions");
        }
    }
}
