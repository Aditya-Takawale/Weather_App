import express, { Request, Response, NextFunction } from 'express';
import AlertLog from '../models/AlertLog';
import AlertConfig from '../models/AlertConfig';
import logger from '../config/logger';
const router = express.Router();

/**
 * Alert API Routes
 * Endpoints for managing weather alerts
 */

// GET /api/alerts/active - Get active alerts
router.get('/active', async (req: Request, res: Response, next: NextFunction) => {
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
});

// GET /api/alerts/history - Get alert history with pagination
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
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
    const query: any = {};
    if (city) query.city = city;
    if (severity) query.severity = severity;
    if (alertType) query.alertType = alertType;
    
    const total = await AlertLog.countDocuments(query);
    
    logger.info(`Fetched ${filteredAlerts.length} alert history records (page ${page})`);
    
    res.json({
      success: true,
      data: filteredAlerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: { city, severity, alertType },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error fetching alert history: ${(error as Error).message}`);
    next(error);
  }
});

// GET /api/alerts/config - Get alert configuration
router.get('/config', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = req.query.city as string || 'Pune';
    const userId = req.query.userId as string;
    
    // Get all enabled rules for the city
    const query: any = { city, isEnabled: true };
    if (userId) query.userId = userId;
    
    const configs = await AlertConfig.getEnabledRules(city, userId);
    
    logger.info(`Fetched ${configs.length} alert configurations for ${city}`);
    
    res.json({
      success: true,
      data: configs,
      count: configs.length,
      filters: { city, userId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error fetching alert config: ${(error as Error).message}`);
    next(error);
  }
});

// PUT /api/alerts/config - Update alert thresholds
router.put('/config', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, ruleName, conditions, messageTemplate, severity, cooldownMinutes, isEnabled, userId } = req.body;
    
    // Validation
    if (!city || !ruleName || !conditions || !Array.isArray(conditions)) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: city, ruleName, conditions (array)'
      });
      return;
    }
    
    // Check if rule already exists
    const existingRule = await AlertConfig.findOne({ city, ruleName, userId });
    
    if (existingRule) {
      // Update existing rule
      existingRule.conditions = conditions;
      if (messageTemplate) existingRule.alertConfig.messageTemplate = messageTemplate;
      if (severity) existingRule.alertConfig.severity = severity;
      if (cooldownMinutes !== undefined) existingRule.alertConfig.cooldownMinutes = cooldownMinutes;
      if (isEnabled !== undefined) existingRule.isEnabled = isEnabled;
      
      await existingRule.save();
      
      logger.info(`Updated alert rule: ${ruleName} for ${city}`);
      
      res.json({
        success: true,
        message: 'Alert rule updated successfully',
        data: existingRule
      });
      return;
    } else {
      // Create new rule
      const newRule = new AlertConfig({
        city,
        ruleName,
        conditions,
        alertConfig: {
          messageTemplate: messageTemplate || `Alert: ${ruleName} triggered`,
          severity: severity || 'WARNING',
          cooldownMinutes: cooldownMinutes || 60,
          notificationChannels: ['email', 'dashboard']
        },
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        userId
      });
      
      await newRule.save();
      
      logger.info(`Created new alert rule: ${ruleName} for ${city}`);
      
      res.status(201).json({
        success: true,
        message: 'Alert rule created successfully',
        data: newRule
      });
      return;
    }
  } catch (error) {
    logger.error(`Error updating alert config: ${(error as Error).message}`);
    next(error);
  }
});

export default router;
