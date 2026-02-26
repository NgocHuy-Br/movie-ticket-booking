package com.movieticket.movieticket.controller;

import com.movieticket.movieticket.dto.ApiResponse;
import com.movieticket.movieticket.service.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
@PreAuthorize("hasRole('ADMIN')")
public class SystemSettingsController {

    private final SystemSettingsService settingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> getAllSettings() {
        Map<String, String> settings = settingsService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success("Get all settings successfully", settings));
    }

    @GetMapping("/{key}")
    public ResponseEntity<ApiResponse<String>> getSettingByKey(@PathVariable String key) {
        try {
            String value = settingsService.getSettingValue(key);
            return ResponseEntity.ok(ApiResponse.success("Get setting successfully", value));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> updateSettings(@RequestBody Map<String, String> settings) {
        try {
            for (Map.Entry<String, String> entry : settings.entrySet()) {
                settingsService.updateSetting(entry.getKey(), entry.getValue());
            }

            Map<String, String> updatedSettings = settingsService.getAllSettings();
            return ResponseEntity.ok(ApiResponse.success("Settings updated successfully", updatedSettings));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{key}")
    public ResponseEntity<ApiResponse<String>> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        try {
            String value = body.get("value");
            if (value == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Value is required"));
            }

            settingsService.updateSetting(key, value);
            return ResponseEntity.ok(ApiResponse.success("Setting updated successfully", value));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
