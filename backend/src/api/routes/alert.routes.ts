import express from 'express';
import alertController from '../controllers/alert.controller';

const router = express.Router();

/**
 * Alert Routes
 * All alert-related API endpoints
 */

// GET /api/alerts/active - Get active alerts
router.get('/active', alertController.getActiveAlerts.bind(alertController));

// GET /api/alerts/history - Get alert history with pagination
router.get('/history', alertController.getAlertHistory.bind(alertController));

// GET /api/alerts/config - Get alert configuration
router.get('/config', alertController.getAlertConfig.bind(alertController));

// PUT /api/alerts/config - Create or update alert configuration
router.put('/config', alertController.updateAlertConfig.bind(alertController));

// DELETE /api/alerts/config/:id - Delete alert configuration
router.delete('/config/:id', alertController.deleteAlertConfig.bind(alertController));

export default router;
