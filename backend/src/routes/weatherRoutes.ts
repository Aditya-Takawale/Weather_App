import express, { Request, Response, NextFunction } from 'express';
import RawWeatherData from '../models/RawWeatherData';
import weatherService from '../services/weatherService';
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

// GET /api/weather/forecast - Get 5-day weather forecast
router.get('/forecast', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const forecast = await weatherService.fetchForecast();
    
    logger.info(`Fetched 5-day forecast`);
    
    res.json({
      success: true,
      data: forecast,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error fetching forecast: ${(error as Error).message}`);
    next(error);
  }
});

// GET /api/weather/air-quality - Get air quality data
router.get('/air-quality', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const airQuality = await weatherService.fetchAirQuality();
    
    logger.info(`Fetched air quality data`);
    
    res.json({
      success: true,
      data: airQuality,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error fetching air quality: ${(error as Error).message}`);
    next(error);
  }
});

// GET /api/weather/uv-index - Get UV index
router.get('/uv-index', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const uvData = await weatherService.fetchUVIndex();
    
    logger.info(`Fetched UV index`);
    
    res.json({
      success: true,
      data: uvData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error fetching UV index: ${(error as Error).message}`);
    next(error);
  }
});

// GET /api/weather/moon - Get moon phase data
router.get('/moon', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const moonData = await weatherService.fetchMoonData();
    
    logger.info(`Fetched moon data`);
    
    res.json({
      success: true,
      data: moonData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error fetching moon data: ${(error as Error).message}`);
    next(error);
  }
});

export default router;
