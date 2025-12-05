// Main Routes Index - Aggregates all API routers
import { Router } from 'express';
import weatherRouter from './weather/weather.router';
import dashboardRouter from './dashboard/dashboard.router';
import alertRouter from './alerts/alert.router';

const router = Router();

// Mount all API routes
router.use('/weather', weatherRouter);
router.use('/dashboard', dashboardRouter);
router.use('/alerts', alertRouter);

export default router;
