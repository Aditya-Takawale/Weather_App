import express, { Request, Response, NextFunction } from 'express';
import RawWeatherData from '../models/RawWeatherData';
import logger from '../config/logger';
const router = express.Router();

/**
 * Weather API Routes
 * Endpoints for accessing raw weather data
 */

// GET /api/weather/current - Get current weather data
router.get('/current', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = req.query.city as string || 'Pune';
    
    const currentWeather = await RawWeatherData.getLatest(city);
    
    if (!currentWeather) {
      res.status(404).json({
        success: false,
        message: `No weather data found for ${city}`
      });
      return;
    }
    
    logger.info(`Fetched current weather for ${city}`);
    
    res.json({
      success: true,
      data: currentWeather,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error fetching current weather: ${(error as Error).message}`);
    next(error);
  }
});

// GET /api/weather/history - Get historical weather data
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = req.query.city as string || 'Pune';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;
    
    // Build query
    const query: any = { city, isDeleted: false };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }
    
    // Get total count for pagination
    const total = await RawWeatherData.countDocuments(query);
    
    // Fetch paginated data
    const skip = (page - 1) * limit;
    const weatherData = await RawWeatherData.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    logger.info(`Fetched ${weatherData.length} historical records for ${city} (page ${page})`);
    
    res.json({
      success: true,
      data: weatherData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        city,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }
    });
  } catch (error) {
    logger.error(`Error fetching weather history: ${(error as Error).message}`);
    next(error);
  }
});

export default router;
