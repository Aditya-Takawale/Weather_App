import { Router } from 'express';
import weatherRoutes from './weather.routes';
import dashboardRoutes from './dashboard.routes';
import alertRoutes from './alert.routes';

const router = Router();

// Mount all routes
router.use('/weather', weatherRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/alerts', alertRoutes);

export default router;
