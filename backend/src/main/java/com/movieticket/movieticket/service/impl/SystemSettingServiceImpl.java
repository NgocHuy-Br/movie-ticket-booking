package com.movieticket.movieticket.service.impl;

import com.movieticket.movieticket.entity.SystemSetting;
import com.movieticket.movieticket.repository.SystemSettingRepository;
import com.movieticket.movieticket.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    @Override
    public SystemSetting getSettingByKey(String key) {
        return systemSettingRepository.findBySettingKey(key).orElse(null);
    }

    @Override
    public Integer getIntegerSetting(String key, Integer defaultValue) {
        SystemSetting setting = getSettingByKey(key);
        if (setting == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(setting.getSettingValue());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    @Override
    public Double getDoubleSetting(String key, Double defaultValue) {
        SystemSetting setting = getSettingByKey(key);
        if (setting == null) {
            return defaultValue;
        }
        try {
            return Double.parseDouble(setting.getSettingValue());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    @Override
    public String getStringSetting(String key, String defaultValue) {
        SystemSetting setting = getSettingByKey(key);
        return setting != null ? setting.getSettingValue() : defaultValue;
    }

    @Override
    public Boolean getBooleanSetting(String key, Boolean defaultValue) {
        SystemSetting setting = getSettingByKey(key);
        if (setting == null) {
            return defaultValue;
        }
        return Boolean.parseBoolean(setting.getSettingValue());
    }

    @Override
    @Transactional
    public SystemSetting updateSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new RuntimeException("Setting not found: " + key));
        setting.setSettingValue(value);
        return systemSettingRepository.save(setting);
    }

    @Override
    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }

    @Override
    @Transactional
    public void initializeDefaultSettings() {
        // MIN_HOURS_BEFORE_CANCEL - Số giờ tối thiểu trước suất chiếu để hủy vé
        if (systemSettingRepository.findBySettingKey("MIN_HOURS_BEFORE_CANCEL").isEmpty()) {
            SystemSetting setting = new SystemSetting();
            setting.setSettingKey("MIN_HOURS_BEFORE_CANCEL");
            setting.setSettingValue("48");
            setting.setDescription("Số giờ tối thiểu trước suất chiếu để được phép hủy vé (mặc định 48 giờ = 2 ngày)");
            setting.setDataType("INTEGER");
            systemSettingRepository.save(setting);
        }

        // REFUND_PERCENTAGE - Tỷ lệ hoàn tiền khi hủy vé
        if (systemSettingRepository.findBySettingKey("REFUND_PERCENTAGE").isEmpty()) {
            SystemSetting setting = new SystemSetting();
            setting.setSettingKey("REFUND_PERCENTAGE");
            setting.setSettingValue("80");
            setting.setDescription("Tỷ lệ phần trăm hoàn tiền khi hủy vé (mặc định 80%)");
            setting.setDataType("DECIMAL");
            systemSettingRepository.save(setting);
        }
    }
}
