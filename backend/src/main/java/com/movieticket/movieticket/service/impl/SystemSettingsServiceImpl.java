package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.entity.SystemSettings;
import com.movieticket.movieticket.repository.SystemSettingsRepository;
import com.movieticket.movieticket.service.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemSettingsServiceImpl implements SystemSettingsService {

    private final SystemSettingsRepository settingsRepository;

    @Override
    public String getSettingValue(String key) {
        return settingsRepository.findBySettingKey(key)
                .map(SystemSettings::getSettingValue)
                .orElseThrow(() -> new RuntimeException("Setting not found: " + key));
    }

    @Override
    public Integer getIntValue(String key) {
        String value = getSettingValue(key);
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid integer value for setting: " + key);
        }
    }

    @Override
    public BigDecimal getDecimalValue(String key) {
        String value = getSettingValue(key);
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid decimal value for setting: " + key);
        }
    }

    @Override
    @Transactional
    public void updateSetting(String key, String value) {
        SystemSettings setting = settingsRepository.findBySettingKey(key)
                .orElseThrow(() -> new RuntimeException("Setting not found: " + key));

        setting.setSettingValue(value);
        settingsRepository.save(setting);
    }

    @Override
    public Map<String, String> getAllSettings() {
        List<SystemSettings> settings = settingsRepository.findAll();
        return settings.stream()
                .collect(Collectors.toMap(
                        SystemSettings::getSettingKey,
                        SystemSettings::getSettingValue));
    }

    @Override
    @Transactional
    public void initializeDefaultSettings() {
        Map<String, String> defaultSettings = new HashMap<>();
        defaultSettings.put("MAX_TICKETS_PER_BOOKING", "10");
        defaultSettings.put("MIN_GAP_BETWEEN_SHOWS", "30");
        defaultSettings.put("AUTO_MARK_ENDED_AFTER_DAYS", "7");
        defaultSettings.put("MIN_HOURS_BEFORE_CANCEL", "48");
        defaultSettings.put("REFUND_PERCENTAGE", "80");

        Map<String, String> descriptions = new HashMap<>();
        descriptions.put("MAX_TICKETS_PER_BOOKING", "Số vé tối đa mỗi lần đặt");
        descriptions.put("MIN_GAP_BETWEEN_SHOWS", "Khoảng cách tối thiểu giữa các suất chiếu (phút)");
        descriptions.put("AUTO_MARK_ENDED_AFTER_DAYS",
                "Số ngày sau suất chiếu cuối để tự động đánh dấu phim đã rời rạp");
        descriptions.put("MIN_HOURS_BEFORE_CANCEL",
                "Số giờ tối thiểu trước suất chiếu để được phép hủy vé (mặc định 48 giờ = 2 ngày)");
        descriptions.put("REFUND_PERCENTAGE",
                "Tỷ lệ phần trăm hoàn tiền khi hủy vé (mặc định 80%)");

        for (Map.Entry<String, String> entry : defaultSettings.entrySet()) {
            if (!settingsRepository.existsBySettingKey(entry.getKey())) {
                SystemSettings setting = new SystemSettings();
                setting.setSettingKey(entry.getKey());
                setting.setSettingValue(entry.getValue());
                setting.setDescription(descriptions.get(entry.getKey()));
                settingsRepository.save(setting);
            }
        }
    }
}
