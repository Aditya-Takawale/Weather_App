import cron from 'node-cron';
import { config } from '../database/config/env';
import logger from '../database/config/logger';

/**
 * Cron Job Scheduler
 * Manages all scheduled jobs for the weather monitoring system
 */

const jobs: Record<string, cron.ScheduledTask> = {};

/**
 * Initialize and start all cron jobs
 */
const startAll = () => {
  try {
    // Job 1: Data Fetching (Every 30 minutes)
    jobs.dataFetch = cron.schedule(config.cronSchedules.dataFetch, async () => {
      logger.info('🔄 [Cron Job 1] Starting data fetch...');
      try {
        const { fetchWeatherData } = await import('./weather/dataFetchJob');
        await fetchWeatherData();
        logger.info('✅ [Cron Job 1] Data fetch completed');
      } catch (error: any) {
        logger.error(`❌ [Cron Job 1] Data fetch failed: ${error.message}`);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    // Job 2: Dashboard Data Population (Every hour)
    jobs.dashboardUpdate = cron.schedule(config.cronSchedules.dashboardUpdate, async () => {
      logger.info('📊 [Cron Job 2] Starting dashboard data update...');
      try {
        const { updateDashboardSummary } = await import('./dashboard/dashboardUpdateJob');
        await updateDashboardSummary();
        logger.info('✅ [Cron Job 2] Dashboard data updated');
      } catch (error: any) {
        logger.error(`❌ [Cron Job 2] Dashboard update failed: ${error.message}`);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    // Job 3: Data Cleanup (Daily at midnight)
    jobs.dataCleanup = cron.schedule(config.cronSchedules.dataCleanup, async () => {
      logger.info('🧹 [Cron Job 3] Starting data cleanup...');
      try {
        const { cleanupOldData } = await import('./dataCleanupJob');
        await cleanupOldData();
        logger.info('✅ [Cron Job 3] Data cleanup completed');
      } catch (error: any) {
        logger.error(`❌ [Cron Job 3] Data cleanup failed: ${error.message}`);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    // Job 4: Weather Alert Check (Every 15 minutes)
    jobs.alertCheck = cron.schedule(config.cronSchedules.alertCheck, async () => {
      logger.info('🚨 [Cron Job 4] Starting alert check...');
      try {
        const { checkWeatherAlerts } = await import('./alerts/alertCheckJob');
        await checkWeatherAlerts();
        logger.info('✅ [Cron Job 4] Alert check completed');
      } catch (error: any) {
        logger.error(`❌ [Cron Job 4] Alert check failed: ${error.message}`);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    logger.info('⏰ All cron jobs scheduled successfully');
    logger.info(`   - Data Fetch: ${config.cronSchedules.dataFetch}`);
    logger.info(`   - Dashboard Update: ${config.cronSchedules.dashboardUpdate}`);
    logger.info(`   - Data Cleanup: ${config.cronSchedules.dataCleanup}`);
    logger.info(`   - Alert Check: ${config.cronSchedules.alertCheck}`);

  } catch (error) {
    logger.error(`❌ Failed to start cron jobs: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Stop all cron jobs
 */
const stopAll = () => {
  Object.keys(jobs).forEach(jobName => {
    if (jobs[jobName]) {
      jobs[jobName].stop();
      logger.info(`⏸️ Stopped cron job: ${jobName}`);
    }
  });
};

/**
 * Get status of all jobs
 */
const getStatus = (): Record<string, string> => {
  return Object.keys(jobs).reduce((status: Record<string, string>, jobName) => {
    status[jobName] = jobs[jobName] ? 'running' : 'stopped';
    return status;
  }, {});
};

export default {
  startAll,
  stopAll,
  getStatus,
  jobs
};
