import dashboardService from '../services/dashboardService';
import logger from '../config/logger';
import { config } from '../config/env';

/**
 * Cron Job 2: Dashboard Data Population
 * Runs every hour to compute and store pre-aggregated summary data
 * This is CRITICAL for dashboard performance - no aggregation at query time!
 */

const updateDashboardSummary = async () => {
  const startTime = Date.now();
  
  try {
    logger.info('📊 [Dashboard Update Job] Starting dashboard data computation...');
    
    const city = config.openWeather.city;
    
    // Compute summary data from raw weather records
    const summary = await dashboardService.computeSummary(city);
    
    if (!summary) {
      logger.warn(`⚠️  [Dashboard Update Job] No data available to compute summary`);
      return {
        success: false,
        message: 'No weather data available'
      };
    }
    
    // Save the computed summary to database
    const savedSummary = await dashboardService.saveSummary(summary);
    
    const duration = Date.now() - startTime;
    
    logger.info(`✅ [Dashboard Update Job] Completed successfully in ${duration}ms`);
    logger.info(`   City: ${savedSummary.city}`);
    logger.info(`   Current Temp: ${savedSummary.current.temperature}°C`);
    logger.info(`   Today's Avg: ${savedSummary.today.avgTemperature}°C`);
    logger.info(`   Today's Min/Max: ${savedSummary.today.minTemperature}°C / ${savedSummary.today.maxTemperature}°C`);
    logger.info(`   Data Points: ${savedSummary.today.dataPointsCount}`);
    logger.info(`   Hourly Trends: ${savedSummary.hourlyTrends.length} entries`);
    logger.info(`   Dominant Weather: ${savedSummary.today.dominantWeather}`);
    
    return {
      success: true,
      message: 'Dashboard summary updated successfully',
      data: savedSummary,
      duration
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as Error;
    logger.error(`❌ [Dashboard Update Job] Error after ${duration}ms: ${err.message}`);
    logger.error(`   Stack: ${err.stack}`);
    
    return {
      success: false,
      message: err.message,
      error: err
    };
  }
};

export { updateDashboardSummary };
