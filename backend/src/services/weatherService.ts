import axios from 'axios';
import { config } from '../config/env';
import logger from '../config/logger';
import RawWeatherData from '../models/RawWeatherData';

/**
 * Weather API Service
 * Handles communication with OpenWeatherMap API
 */

class WeatherService {
  private apiKey: string;
  private apiUrl: string;
  private city: string;
  private countryCode: string;

  constructor() {
    this.apiKey = config.openWeather.apiKey;
    this.apiUrl = config.openWeather.apiUrl;
    this.city = config.openWeather.city;
    this.countryCode = config.openWeather.countryCode;
  }

  /**
   * Fetch current weather data from OpenWeatherMap API
   */
  async fetchCurrentWeather(): Promise<any> {
    try {
      const url = `${this.apiUrl}?q=${this.city},${this.countryCode}&appid=${this.apiKey}&units=metric`;
      
      logger.info(`Fetching weather data for ${this.city}...`);
      
      const response = await axios.get(url, {
        timeout: 10000 // 10 second timeout
      });

      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = response.data;
      
      // Transform API response to our schema format
      const weatherData = this.transformApiResponse(data);
      
      logger.info(`✅ Weather data fetched successfully for ${this.city}`);
      logger.debug(`Temperature: ${weatherData.temperature}°C, Weather: ${weatherData.weatherMain}`);
      
      return weatherData;
      
    } catch (error: any) {
      if (error.response) {
        // API returned an error response
        logger.error(`❌ OpenWeatherMap API error: ${error.response.status} - ${error.response.data.message}`);
        throw new Error(`API Error: ${error.response.data.message}`);
      } else if (error.request) {
        // Request made but no response
        logger.error(`❌ No response from OpenWeatherMap API`);
        throw new Error('No response from weather API');
      } else {
        // Other errors
        logger.error(`❌ Weather fetch error: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Transform OpenWeatherMap API response to our schema format
   * Note: API is called with units=metric, so temperatures are already in Celsius
   */
  transformApiResponse(apiData: any) {
    return {
      city: this.city,
      timestamp: new Date(apiData.dt * 1000), // Convert Unix timestamp to Date
      
      // Coordinates
      coordinates: {
        lon: apiData.coord.lon,
        lat: apiData.coord.lat
      },
      
      // Weather information
      weatherId: apiData.weather[0].id,
      weatherMain: apiData.weather[0].main,
      weatherDescription: apiData.weather[0].description,
      weatherIcon: apiData.weather[0].icon,
      
      // Main data - Already in Celsius from API (units=metric)
      temperature: Math.round(apiData.main.temp * 10) / 10,
      feelsLike: Math.round(apiData.main.feels_like * 10) / 10,
      tempMin: Math.round(apiData.main.temp_min * 10) / 10,
      tempMax: Math.round(apiData.main.temp_max * 10) / 10,
      pressure: apiData.main.pressure, // hPa (hectopascals)
      humidity: apiData.main.humidity, // percentage
      seaLevel: apiData.main.sea_level,
      groundLevel: apiData.main.grnd_level,
      
      // Wind data - m/s from API, convert to km/h for display
      windSpeed: Math.round(apiData.wind.speed * 3.6 * 10) / 10, // m/s to km/h
      windDirection: apiData.wind.deg,
      windGust: apiData.wind.gust ? Math.round(apiData.wind.gust * 3.6 * 10) / 10 : undefined,
      
      // Additional data
      cloudiness: apiData.clouds.all, // percentage
      visibility: apiData.visibility, // meters
      
      // System data
      country: apiData.sys.country,
      sunrise: new Date(apiData.sys.sunrise * 1000),
      sunset: new Date(apiData.sys.sunset * 1000),
      
      // API metadata
      dt: apiData.dt,
      timezone: apiData.timezone,
      
      // Soft delete
      isDeleted: false
    };
  }

  /**
   * Save weather data to database
   */
  async saveWeatherData(weatherData: any) {
    try {
      const record = new RawWeatherData(weatherData);
      await record.save();
      
      logger.info(`💾 Weather data saved to database`);
      return record;
      
    } catch (error) {
      logger.error(`❌ Failed to save weather data: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Fetch and save weather data (combined operation)
   */
  async fetchAndSave(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const weatherData = await this.fetchCurrentWeather();
      const savedRecord = await this.saveWeatherData(weatherData);
      
      return {
        success: true,
        data: savedRecord
      };
      
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
}

export default new WeatherService();
