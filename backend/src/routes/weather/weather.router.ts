// Weather API Router - Defines all weather-related endpoints
import { Router } from 'express';
import weatherController from '../../controllers/weather/weather.controller';
import { weatherQueryValidation } from '../../validations';

const router = Router();

// GET /api/weather/current - Get current weather data
router.get('/current', weatherQueryValidation, weatherController.getCurrentWeather.bind(weatherController));

// GET /api/weather/history - Get historical weather data with pagination
router.get('/history', weatherQueryValidation, weatherController.getWeatherHistory.bind(weatherController));

// GET /api/weather/forecast - Get 5-day weather forecast
router.get('/forecast', weatherController.getForecast.bind(weatherController));

// GET /api/weather/air-quality - Get air quality data
router.get('/air-quality', weatherController.getAirQuality.bind(weatherController));

// GET /api/weather/uv-index - Get UV index data
router.get('/uv-index', weatherController.getUVIndex.bind(weatherController));

// GET /api/weather/moon - Get moon phase data
router.get('/moon', weatherController.getMoonData.bind(weatherController));

export default router;
