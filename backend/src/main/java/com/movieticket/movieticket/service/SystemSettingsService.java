package com.movieticket.movieticket.service;

import java.math.BigDecimal;
import java.util.Map;

public interface SystemSettingsService {

    String getSettingValue(String key);

    Integer getIntValue(String key);

    BigDecimal getDecimalValue(String key);

    void updateSetting(String key, String value);

    Map<String, String> getAllSettings();

    void initializeDefaultSettings();
}
