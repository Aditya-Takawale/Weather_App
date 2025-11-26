import weatherService from '../services/weatherService';
import logger from '../config/logger';

/**
 * Cron Job 1: Data Fetching
 * Fetches weather data from OpenWeatherMap API every 30 minutes
 * and stores it in the RawWeatherData collection
 */

const fetchWeatherData = async () => {
  const startTime = Date.now();
  
  try {
    logger.info('🌤️  [Data Fetch Job] Starting weather data fetch...');
    
    // Fetch and save weather data
    const result = await weatherService.fetchAndSave();
    
    if (result.success) {
      const duration = Date.now() - startTime;
      logger.info(`✅ [Data Fetch Job] Completed successfully in ${duration}ms`);
      logger.info(`   City: ${result.data.city}`);
      logger.info(`   Temperature: ${result.data.temperature}°C`);
      logger.info(`   Weather: ${result.data.weatherMain}`);
      logger.info(`   Humidity: ${result.data.humidity}%`);
      logger.info(`   Timestamp: ${result.data.timestamp.toISOString()}`);
      
      return {
        success: true,
        message: 'Weather data fetched and stored successfully',
        data: result.data
      };
    } else {
      logger.error(`❌ [Data Fetch Job] Failed: ${result.error}`);
      
      return {
        success: false,
        message: result.error
      };
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as Error;
    logger.error(`❌ [Data Fetch Job] Error after ${duration}ms: ${err.message}`);
    logger.error(`   Stack: ${err.stack}`);
    
    return {
      success: false,
      message: err.message,
      error: err
    };
  }
};

export { fetchWeatherData };
