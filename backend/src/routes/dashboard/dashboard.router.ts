// Dashboard API Router - Defines all dashboard-related endpoints
import { Router } from 'express';
import dashboardController from '../../controllers/dashboard/dashboard.controller';
import { dashboardQueryValidation } from '../../validations';

const router = Router();

// GET /api/dashboard/summary - Get dashboard summary with optional force refresh
router.get('/summary', dashboardQueryValidation, dashboardController.getDashboardSummary.bind(dashboardController));

// GET /api/dashboard/trends - Get hourly weather trends
router.get('/trends', dashboardQueryValidation, dashboardController.getHourlyTrends.bind(dashboardController));

// POST /api/dashboard/reports - Get paginated report details
router.post('/reports', dashboardController.getReportDetails.bind(dashboardController));

// POST /api/dashboard/export - Export dashboard data
router.post('/export', dashboardController.exportData.bind(dashboardController));

export default router;
