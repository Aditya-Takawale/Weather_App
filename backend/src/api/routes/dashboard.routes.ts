import express from 'express';
import dashboardController from '../controllers/dashboard.controller';

const router = express.Router();

/**
 * Dashboard Routes
 * All dashboard-related API endpoints
 */

// GET /api/dashboard/summary - Get pre-aggregated dashboard data
router.get('/summary', dashboardController.getDashboardSummary.bind(dashboardController));

// GET /api/dashboard/trends - Get hourly trends for charts
router.get('/trends', dashboardController.getHourlyTrends.bind(dashboardController));

// POST /api/dashboard/reports - Get report details with filters
router.post('/reports', dashboardController.getReportDetails.bind(dashboardController));

// POST /api/dashboard/export - Export dashboard data
router.post('/export', dashboardController.exportData.bind(dashboardController));

export default router;
