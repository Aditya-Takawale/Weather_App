import { Request, Response, NextFunction } from 'express';
import dashboardService from '../services/dashboard.service';
import logger from '../config/logger';

/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard-related endpoints
 */

class DashboardController {
  /**
   * Get dashboard summary with pre-aggregated data
   * GET /api/dashboard/summary
   */
  async getDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const city = req.query.city as string || 'Pune';
      const forceRefresh = req.query.refresh === 'true';
      
      const summary = await dashboardService.getDashboardSummary(city, forceRefresh);
      
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
  }

  /**
   * Get hourly trends for dashboard charts
   * GET /api/dashboard/trends
   */
  async getHourlyTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const city = req.query.city as string || 'Pune';
      const hours = parseInt(req.query.hours as string) || 48;
      
      const trends = await dashboardService.getHourlyTrends(city, hours);
      
      logger.info(`Delivered ${hours}h trends for ${city}`);
      
      res.json({
        success: true,
        data: trends,
        city,
        hoursRequested: hours,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error fetching hourly trends: ${(error as Error).message}`);
      next(error);
    }
  }

  /**
   * Get report details with pagination and filters
   * POST /api/dashboard/reports
   */
  async getReportDetails(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const {
        searchText,
        startDate,
        endDate,
        limit,
        offset,
        isExport
      } = req.body;

      const result = await dashboardService.getReportDetails({
        searchText,
        startDate,
        endDate,
        limit,
        offset,
        isExport
      });

      logger.info(`Fetched report details - ${result.totalRecords} records`);

      res.json(result);
    } catch (error) {
      logger.error(`Error fetching report details: ${(error as Error).message}`);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong'
      });
    }
  }

  /**
   * Export dashboard data
   * POST /api/dashboard/export
   */
  async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exportData = await dashboardService.exportData(req.body);
      
      logger.info(`Exported dashboard data`);
      
      res.json({
        success: true,
        data: exportData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error exporting data: ${(error as Error).message}`);
      next(error);
    }
  }
}

export default new DashboardController();
