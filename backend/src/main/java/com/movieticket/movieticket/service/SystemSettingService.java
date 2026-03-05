package com.movieticket.movieticket.service;

import com.movieticket.movieticket.entity.SystemSetting;
import java.util.List;

public interface SystemSettingService {
    SystemSetting getSettingByKey(String key);

    Integer getIntegerSetting(String key, Integer defaultValue);

    Double getDoubleSetting(String key, Double defaultValue);

    String getStringSetting(String key, String defaultValue);

    Boolean getBooleanSetting(String key, Boolean defaultValue);

    SystemSetting updateSetting(String key, String value);

    List<SystemSetting> getAllSettings();

    void initializeDefaultSettings();
}
