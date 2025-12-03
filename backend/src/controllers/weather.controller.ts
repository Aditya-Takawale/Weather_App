import { Request, Response, NextFunction } from 'express';
import weatherService from '../services/weather.service';
import logger from '../config/logger';

/**
 * Weather Controller
 * Handles HTTP requests for weather-related endpoints
 */

class WeatherController {
  /**
   * Get current weather data for a city
   * GET /api/weather/current
   */
  async getCurrentWeather(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const city = req.query.city as string || 'Pune';
      
      const currentWeather = await weatherService.getCurrentWeather(city);
      
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
  }

  /**
   * Get historical weather data with pagination
   * GET /api/weather/history
   */
  async getWeatherHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const city = req.query.city as string || 'Pune';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;
      
      const result = await weatherService.getWeatherHistory(city, page, limit, startDate, endDate);
      
      logger.info(`Fetched weather history for ${city} - Page ${page}, ${result.data.length} records`);
      
      res.json(result);
    } catch (error) {
      logger.error(`Error fetching weather history: ${(error as Error).message}`);
      next(error);
    }
  }

  /**
   * Get 5-day weather forecast
   * GET /api/weather/forecast
   */
  async getForecast(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const forecast = await weatherService.getForecast();
      
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
  }

  /**
   * Get air quality data
   * GET /api/weather/air-quality
   */
  async getAirQuality(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const airQuality = await weatherService.getAirQuality();
      
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
  }

  /**
   * Get UV index data
   * GET /api/weather/uv-index
   */
  async getUVIndex(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const uvIndex = await weatherService.getUVIndex();
      
      logger.info(`Fetched UV index`);
      
      res.json({
        success: true,
        data: uvIndex,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error fetching UV index: ${(error as Error).message}`);
      next(error);
    }
  }

  /**
   * Get moon phase data
   * GET /api/weather/moon
   */
  async getMoonData(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moonData = await weatherService.getMoonData();
      
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
  }
}

export default new WeatherController();
