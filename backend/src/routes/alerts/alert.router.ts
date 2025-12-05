// Alert API Router - Defines all alert-related endpoints
import { Router } from 'express';
import alertController from '../../controllers/alerts/alert.controller';
import { alertQueryValidation, alertConfigValidation } from '../../validations';

const router = Router();

// GET /api/alerts/active - Get active alerts
router.get('/active', alertQueryValidation, alertController.getActiveAlerts.bind(alertController));

// GET /api/alerts/history - Get alert history with pagination
router.get('/history', alertQueryValidation, alertController.getAlertHistory.bind(alertController));

// GET /api/alerts/config - Get alert configuration
router.get('/config', alertController.getAlertConfig.bind(alertController));

// PUT /api/alerts/config - Create or update alert configuration
router.put('/config', alertConfigValidation, alertController.updateAlertConfig.bind(alertController));

// DELETE /api/alerts/config/:id - Delete alert configuration
router.delete('/config/:id', alertController.deleteAlertConfig.bind(alertController));

export default router;
