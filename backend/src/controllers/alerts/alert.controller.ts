import { Request, Response, NextFunction } from 'express';
import AlertLog from '../../models/alerts/AlertLog';
import AlertConfig, { IAlertConfig } from '../../models/alerts/AlertConfig';
import logger from '../../database/config/logger';

/**
 * Alert Controller
 * Handles HTTP requests for alert-related endpoints
 */

class AlertController {
  /**
   * Get active alerts
   * GET /api/alerts/active
   */
  async getActiveAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const city = req.query.city as string;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const activeAlerts = await AlertLog.getActive(city, limit);
      
      logger.info(`Fetched ${activeAlerts.length} active alerts${city ? ` for ${city}` : ''}`);
      
      res.json({
        success: true,
        data: activeAlerts,
        count: activeAlerts.length,
        filters: { city, onlyActive: true },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error fetching active alerts: ${(error as Error).message}`);
      next(error);
    }
  }

  /**
   * Get alert history with pagination
   * GET /api/alerts/history
   */
  async getAlertHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const city = req.query.city as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const severity = req.query.severity as string;
      const alertType = req.query.alertType as string;
      
      const alerts = await AlertLog.getRecent(city, page, limit);
      
      // Apply additional filters if provided
      let filteredAlerts = alerts;
      if (severity) {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
      }
      if (alertType) {
        filteredAlerts = filteredAlerts.filter(alert => alert.alertType === alertType);
      }
      
      // Get total count for pagination
      const totalCount = await AlertLog.countDocuments({ city });
      const totalPages = Math.ceil(totalCount / limit);
      
      logger.info(`Fetched alert history - Page ${page}/${totalPages}, ${filteredAlerts.length} records`);
      
      res.json({
        success: true,
        data: filteredAlerts,
        pagination: {
          page,
          limit,
          totalRecords: totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        filters: { city, severity, alertType },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error fetching alert history: ${(error as Error).message}`);
      next(error);
    }
  }

  /**
   * Get alert configuration for a user
   * GET /api/alerts/config
   */
  async getAlertConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const city = req.query.city as string || 'Pune';
      const userId = req.query.userId as string;
      
      const configs = await AlertConfig.getEnabledRules(city, userId || null);
      
      // Filter by userId if provided
      const filteredConfigs = userId
        ? configs.filter((config: IAlertConfig) => config.userId === userId)
        : configs;
      
      logger.info(`Fetched ${filteredConfigs.length} alert configs for ${city}`);
      
      res.json({
        success: true,
        data: filteredConfigs,
        count: filteredConfigs.length,
        city,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error fetching alert configs: ${(error as Error).message}`);
      next(error);
    }
  }

  /**
   * Create or update alert configuration
   * PUT /api/alerts/config
   */
  async updateAlertConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const configData = req.body;
      
      // Validate required fields
      if (!configData.city || !configData.alertType || !configData.threshold) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: city, alertType, threshold'
        });
        return;
      }
      
      const newConfig = new AlertConfig(configData);
      await newConfig.save();
      
      logger.info(`Created/Updated alert config for ${configData.city} - ${configData.alertType}`);
      
      res.json({
        success: true,
        message: 'Alert configuration saved successfully',
        data: newConfig,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error saving alert config: ${(error as Error).message}`);
      next(error);
    }
  }

  /**
   * Delete alert configuration
   * DELETE /api/alerts/config/:id
   */
  async deleteAlertConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const configId = req.params.id;
      
      const config = await AlertConfig.findById(configId);
      
      if (!config) {
        res.status(404).json({
          success: false,
          message: 'Alert configuration not found'
        });
        return;
      }
      
      config.isEnabled = false;
      await config.save();
      
      logger.info(`Deleted alert config: ${configId}`);
      
      res.json({
        success: true,
        message: 'Alert configuration deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error deleting alert config: ${(error as Error).message}`);
      next(error);
    }
  }
}

export default new AlertController();
