import RawWeatherData from '../models/weather/RawWeatherData';
import logger from '../database/config/logger';
import { config } from '../database/config/env';

/**
 * Cron Job 3: Data Cleanup
 * Runs daily to delete or archive weather records older than 2 days
 */

const cleanupOldData = async () => {
  const startTime = Date.now();
  
  try {
    logger.info('🧹 [Data Cleanup Job] Starting data cleanup...');
    
    const retentionDays = config.dataRetentionDays;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    logger.info(`   Removing data older than: ${cutoffDate.toISOString()}`);
    
    // Soft delete: Mark records as deleted
    const result = await RawWeatherData.updateMany(
      {
        timestamp: { $lt: cutoffDate },
        isDeleted: false
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date()
        }
      }
    ).exec();
    
    const duration = Date.now() - startTime;
    
    logger.info(`✅ [Data Cleanup Job] Completed in ${duration}ms`);
    logger.info(`   Records marked for deletion: ${result.modifiedCount}`);
    
    // Optional: Hard delete records that have been soft-deleted for more than 7 days
    const hardDeleteCutoff = new Date();
    hardDeleteCutoff.setDate(hardDeleteCutoff.getDate() - (retentionDays + 7));
    
    const hardDeleteResult = await RawWeatherData.deleteMany({
      isDeleted: true,
      deletedAt: { $lt: hardDeleteCutoff }
    }).exec();
    
    if (hardDeleteResult.deletedCount > 0) {
      logger.info(`   Records permanently deleted: ${hardDeleteResult.deletedCount}`);
    }
    
    return {
      success: true,
      message: 'Data cleanup completed successfully',
      softDeleted: result.modifiedCount,
      hardDeleted: hardDeleteResult.deletedCount,
      duration
    };
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`❌ [Data Cleanup Job] Error after ${duration}ms: ${error.message}`);
    logger.error(`   Stack: ${error.stack}`);
    
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

export { cleanupOldData };
