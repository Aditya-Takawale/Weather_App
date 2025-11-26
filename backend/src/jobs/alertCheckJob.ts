import RawWeatherData from '../models/RawWeatherData';
import AlertLog from '../models/AlertLog';
import AlertConfig from '../models/AlertConfig';
import logger from '../config/logger';
import { config } from '../config/env';

/**
 * Cron Job 4: Weather Alert Notification
 * Runs every 15 minutes to check weather conditions against thresholds
 * and create alerts when violations are detected
 */

const checkWeatherAlerts = async () => {
  const startTime = Date.now();
  
  try {
    logger.info('🚨 [Alert Check Job] Starting alert check...');
    
    const city = config.openWeather.city;
    
    // Get latest weather data
    const latestWeather = await RawWeatherData.getLatest(city);
    
    if (!latestWeather) {
      logger.warn('⚠️  [Alert Check Job] No weather data available');
      return {
        success: false,
        message: 'No weather data available for alert checking'
      };
    }
    
    const alertsCreated: any[] = [];
    
    // Check default threshold rules
    await checkDefaultThresholds(latestWeather, alertsCreated);
    
    // Check custom configured rules
    const customRules = await AlertConfig.getEnabledRules(city);
    await checkCustomRules(latestWeather, customRules, alertsCreated);
    
    const duration = Date.now() - startTime;
    
    if (alertsCreated.length > 0) {
      logger.info(`✅ [Alert Check Job] Completed in ${duration}ms`);
      logger.info(`   Alerts created: ${alertsCreated.length}`);
      alertsCreated.forEach(alert => {
        logger.info(`   - ${alert.alertType}: ${alert.message}`);
      });
    } else {
      logger.info(`✅ [Alert Check Job] Completed in ${duration}ms - No alerts triggered`);
    }
    
    return {
      success: true,
      message: 'Alert check completed',
      alertsCreated: alertsCreated.length,
      duration
    };
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`❌ [Alert Check Job] Error after ${duration}ms: ${error.message}`);
    logger.error(`   Stack: ${error.stack}`);
    
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

/**
 * Check default threshold rules
 */
async function checkDefaultThresholds(weather: any, alertsCreated: any[]) {
  const city = weather.city;
  
  // High Temperature Alert
  if (weather.temperature > config.alerts.highTempThreshold) {
    const alert = await AlertLog.createIfNotDuplicate({
      city,
      alertType: 'HIGH_TEMP',
      severity: weather.temperature > config.alerts.highTempThreshold + 5 ? 'CRITICAL' : 'WARNING',
      message: `High temperature detected: ${weather.temperature}°C (Threshold: ${config.alerts.highTempThreshold}°C)`,
      threshold: {
        parameter: 'temperature',
        operator: '>',
        value: config.alerts.highTempThreshold,
        unit: '°C'
      },
      actualValue: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        weatherCondition: weather.weatherMain,
        timestamp: weather.timestamp
      },
      isActive: true,
      notificationSent: false,
      notificationChannel: ['console']
    });
    
    if (alert) {
      alertsCreated.push(alert);
    }
  }
  
  // High Humidity Alert
  if (weather.humidity > config.alerts.highHumidityThreshold) {
    const alert = await AlertLog.createIfNotDuplicate({
      city,
      alertType: 'HIGH_HUMIDITY',
      severity: weather.humidity > config.alerts.highHumidityThreshold + 10 ? 'CRITICAL' : 'WARNING',
      message: `High humidity detected: ${weather.humidity}% (Threshold: ${config.alerts.highHumidityThreshold}%)`,
      threshold: {
        parameter: 'humidity',
        operator: '>',
        value: config.alerts.highHumidityThreshold,
        unit: '%'
      },
      actualValue: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        weatherCondition: weather.weatherMain,
        timestamp: weather.timestamp
      },
      isActive: true,
      notificationSent: false,
      notificationChannel: ['console']
    });
    
    if (alert) {
      alertsCreated.push(alert);
    }
  }
  
  // Extreme Weather Alert
  if (config.alerts.extremeWeatherConditions.includes(weather.weatherMain)) {
    const alert = await AlertLog.createIfNotDuplicate({
      city,
      alertType: 'EXTREME_WEATHER',
      severity: 'CRITICAL',
      message: `Extreme weather condition: ${weather.weatherMain} - ${weather.weatherDescription}`,
      threshold: {
        parameter: 'weatherCondition',
        operator: 'contains',
        value: weather.weatherMain,
        unit: ''
      },
      actualValue: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        weatherCondition: weather.weatherMain,
        timestamp: weather.timestamp
      },
      isActive: true,
      notificationSent: false,
      notificationChannel: ['console']
    });
    
    if (alert) {
      alertsCreated.push(alert);
    }
  }
}

/**
 * Check custom configured rules
 */
async function checkCustomRules(weather: any, rules: any[], alertsCreated: any[]) {
  for (const rule of rules) {
    const isTriggered = rule.evaluate(weather);
    
    if (isTriggered) {
      const message = rule.generateMessage(weather);
      
      const alert = await AlertLog.createIfNotDuplicate({
        city: weather.city,
        alertType: 'CUSTOM',
        severity: rule.alertConfig.severity,
        message,
        threshold: rule.conditions[0], // Use first condition for threshold info
        actualValue: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          weatherCondition: weather.weatherMain,
          windSpeed: weather.windSpeed,
          pressure: weather.pressure,
          timestamp: weather.timestamp
        },
        isActive: true,
        notificationSent: false,
        notificationChannel: rule.alertConfig.notificationChannels,
        ruleId: rule._id.toString()
      }, rule.alertConfig.cooldownMinutes);
      
      if (alert) {
        alertsCreated.push(alert);
      }
    }
  }
}

export { checkWeatherAlerts };
