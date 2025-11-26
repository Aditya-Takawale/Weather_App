import express, { Request, Response, NextFunction } from 'express';
import DashboardSummary from '../models/DashboardSummary';
import dashboardService from '../services/dashboardService';
import logger from '../config/logger';
const router = express.Router();

/**
 * Dashboard API Routes
 * High-performance endpoints for Angular dashboard
 */

// GET /api/dashboard/summary - Get pre-aggregated dashboard data
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = req.query.city as string || 'Pune';
    const forceRefresh = req.query.refresh === 'true';
    
    let summary;
    
    if (forceRefresh) {
      // Compute fresh summary on demand
      logger.info(`Force refresh requested for ${city} dashboard`);
      summary = await dashboardService.computeSummary(city);
      if (summary) {
        await dashboardService.saveSummary(summary);
      }
    } else {
      // Get cached summary from database
      summary = await DashboardSummary.getLatest(city);
      
      // If no cached data, compute fresh
      if (!summary) {
        logger.warn(`No cached summary for ${city}, computing fresh data`);
        summary = await dashboardService.computeSummary(city);
        if (summary) {
          await dashboardService.saveSummary(summary);
        }
      }
    }
    
    if (!summary) {
      res.status(404).json({
        success: false,
        message: `No dashboard data available for ${city}. Please wait for data collection.`
      });
      return;
    }
    
    logger.info(`Delivered dashboard summary for ${city}`);
    
    res.json({
      success: true,
      data: summary,
      cached: !forceRefresh,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error fetching dashboard summary: ${(error as Error).message}`);
    next(error);
  }
});

// GET /api/dashboard/trends - Get hourly trends
router.get('/trends', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = req.query.city as string || 'Pune';
    const hours = parseInt(req.query.hours as string) || 48;
    
    // Get latest summary which includes hourly trends
    const summary = await DashboardSummary.getLatest(city);
    
    if (!summary || !summary.hourlyTrends) {
      res.status(404).json({
        success: false,
        message: `No trend data available for ${city}`
      });
      return;
    }
    
    // Filter trends by requested hours
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const filteredTrends = summary.hourlyTrends.filter(
      trend => new Date(trend.hour) >= cutoffTime
    );
    
    logger.info(`Delivered ${filteredTrends.length} hourly trends for ${city}`);
    
    res.json({
      success: true,
      data: {
        city,
        hours,
        trends: filteredTrends,
        dataPoints: filteredTrends.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error fetching dashboard trends: ${(error as Error).message}`);
    next(error);
  }
});

export default router;
