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
  private airPollutionUrl: string;
  private forecastUrl: string;
  private city: string;
  private countryCode: string;
  private lat: number;
  private lon: number;

  constructor() {
    this.apiKey = config.openWeather.apiKey;
    this.apiUrl = config.openWeather.apiUrl;
    this.airPollutionUrl = 'https://api.openweathermap.org/data/2.5/air_pollution';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    this.city = config.openWeather.city;
    this.countryCode = config.openWeather.countryCode;
    // Pune coordinates
    this.lat = 18.5204;
    this.lon = 73.8567;
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

  /**
   * Fetch 5-day weather forecast (3-hour intervals)
   */
  async fetchForecast(): Promise<any> {
    try {
      const url = `${this.forecastUrl}?q=${this.city},${this.countryCode}&appid=${this.apiKey}&units=metric`;
      
      logger.info(`Fetching 5-day forecast for ${this.city}...`);
      
      const response = await axios.get(url, {
        timeout: 10000
      });

      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }

      // Transform forecast to daily summary
      const dailyForecast = this.transformForecastToDaily(response.data);
      
      logger.info(`✅ Forecast data fetched successfully`);
      return dailyForecast;
      
    } catch (error: any) {
      logger.error(`❌ Forecast fetch error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transform 3-hour forecast data to daily summary
   */
  private transformForecastToDaily(forecastData: any) {
    const dailyMap = new Map<string, any[]>();
    
    // Group by date
    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyMap.has(date)) {
        dailyMap.set(date, []);
      }
      dailyMap.get(date)!.push(item);
    });

    // Get next 5 days
    const daily = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let count = 0;

    for (const [date, items] of dailyMap.entries()) {
      if (count >= 5) break;
      
      const temps = items.map(i => i.main.temp);
      const weatherCounts = new Map<string, number>();
      
      items.forEach(i => {
        const weather = i.weather[0].main;
        weatherCounts.set(weather, (weatherCounts.get(weather) || 0) + 1);
      });

      // Most common weather condition
      let dominantWeather = 'Clear';
      let maxCount = 0;
      weatherCounts.forEach((count, weather) => {
        if (count > maxCount) {
          maxCount = count;
          dominantWeather = weather;
        }
      });

      const dayOfWeek = days[new Date(date).getDay()];
      
      daily.push({
        date,
        name: dayOfWeek,
        icon: this.getWeatherIcon(dominantWeather),
        high: Math.round(Math.max(...temps)),
        low: Math.round(Math.min(...temps)),
        weather: dominantWeather
      });
      
      count++;
    }

    return daily;
  }

  /**
   * Map weather condition to Material icon
   */
  private getWeatherIcon(weather: string): string {
    const iconMap: { [key: string]: string } = {
      'Clear': 'wb_sunny',
      'Clouds': 'wb_cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'thunderstorm',
      'Snow': 'ac_unit',
      'Mist': 'cloud',
      'Smoke': 'cloud',
      'Haze': 'cloud',
      'Dust': 'cloud',
      'Fog': 'cloud',
      'Sand': 'cloud',
      'Ash': 'cloud',
      'Squall': 'air',
      'Tornado': 'air'
    };
    
    return iconMap[weather] || 'wb_cloudy';
  }

  /**
   * Fetch air quality data
   */
  async fetchAirQuality(): Promise<any> {
    try {
      const url = `${this.airPollutionUrl}?lat=${this.lat}&lon=${this.lon}&appid=${this.apiKey}`;
      
      logger.info(`Fetching air quality for ${this.city}...`);
      
      const response = await axios.get(url, {
        timeout: 10000
      });

      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }

      const aqi = response.data.list[0].main.aqi;
      const components = response.data.list[0].components;
      
      const airQualityData = {
        aqi: this.calculateAQI(components),
        label: this.getAQILabel(aqi),
        components: {
          pm2_5: components.pm2_5,
          pm10: components.pm10,
          no2: components.no2,
          o3: components.o3,
          co: components.co
        }
      };
      
      logger.info(`✅ Air quality fetched: AQI ${airQualityData.aqi} (${airQualityData.label})`);
      return airQualityData;
      
    } catch (error: any) {
      logger.error(`❌ Air quality fetch error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate US EPA AQI from components
   */
  private calculateAQI(components: any): number {
    // Calculate AQI from PM2.5 (simplified)
    const pm25 = components.pm2_5;
    if (pm25 <= 12.0) return Math.round((50 / 12.0) * pm25);
    if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
    if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
    if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
    if (pm25 <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
    return Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301);
  }

  /**
   * Get AQI label
   */
  private getAQILabel(aqi: number): string {
    if (aqi <= 50) return 'GOOD';
    if (aqi <= 100) return 'MODERATE';
    if (aqi <= 150) return 'UNHEALTHY FOR SENSITIVE GROUPS';
    if (aqi <= 200) return 'UNHEALTHY';
    if (aqi <= 300) return 'VERY UNHEALTHY';
    return 'HAZARDOUS';
  }

  /**
   * Fetch UV index (Note: Requires OneCall API 3.0 subscription)
   * For free tier, we'll calculate estimated UV index
   */
  async fetchUVIndex(): Promise<any> {
    try {
      // Since OneCall 3.0 requires subscription, estimate UV from time of day and cloudiness
      const currentWeather = await RawWeatherData.getLatest(this.city);
      
      if (!currentWeather) {
        return { uvIndex: 0, label: 'LOW' };
      }

      const now = new Date();
      const sunrise = new Date(currentWeather.sunrise);
      const sunset = new Date(currentWeather.sunset);
      const cloudiness = currentWeather.cloudiness;

      // Calculate UV based on time of day (simplified model)
      let uvIndex = 0;
      
      if (now >= sunrise && now <= sunset) {
        const totalDaylight = sunset.getTime() - sunrise.getTime();
        const timeSinceSunrise = now.getTime() - sunrise.getTime();
        const percentOfDay = timeSinceSunrise / totalDaylight;
        
        // UV peaks at solar noon (50% of day)
        const solarNoonFactor = 1 - Math.abs(percentOfDay - 0.5) * 2;
        
        // Base UV (max 11)
        const baseUV = 11;
        
        // Reduce by cloud cover
        const cloudFactor = 1 - (cloudiness / 200);
        
        uvIndex = Math.round(baseUV * solarNoonFactor * cloudFactor);
      }

      const uvData = {
        uvIndex,
        label: this.getUVLabel(uvIndex)
      };
      
      logger.info(`✅ UV Index calculated: ${uvIndex} (${uvData.label})`);
      return uvData;
      
    } catch (error: any) {
      logger.error(`❌ UV index calculation error: ${error.message}`);
      return { uvIndex: 0, label: 'LOW' };
    }
  }

  /**
   * Get UV index label
   */
  private getUVLabel(uvIndex: number): string {
    if (uvIndex <= 2) return 'LOW';
    if (uvIndex <= 5) return 'MODERATE';
    if (uvIndex <= 7) return 'HIGH';
    if (uvIndex <= 10) return 'VERY HIGH';
    return 'EXTREME';
  }

  /**
   * Calculate moon phase data
   */
  async fetchMoonData(): Promise<any> {
    try {
      const now = new Date();
      
      // Calculate days since known new moon (Jan 6, 2000)
      const knownNewMoon = new Date(2000, 0, 6);
      const daysSinceKnownNewMoon = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
      
      // Lunar cycle is ~29.53 days
      const lunarCycle = 29.53;
      const phase = (daysSinceKnownNewMoon % lunarCycle) / lunarCycle;
      
      // Calculate illumination percentage
      const illumination = Math.round(50 * (1 - Math.cos(phase * 2 * Math.PI)));
      
      // Estimate moonrise (simplified - about 50 minutes later each day)
      const moonriseHour = 12 + Math.floor(phase * 24);
      const currentHour = now.getHours();
      let hoursUntilMoonrise = moonriseHour - currentHour;
      if (hoursUntilMoonrise < 0) hoursUntilMoonrise += 24;
      
      // Days until next full moon
      const daysInCycle = phase * lunarCycle;
      const daysUntilFull = daysInCycle < lunarCycle / 2 
        ? Math.round(lunarCycle / 2 - daysInCycle)
        : Math.round(lunarCycle * 1.5 - daysInCycle);
      
      const moonData = {
        illumination,
        moonriseIn: hoursUntilMoonrise < 1 
          ? `${Math.round(hoursUntilMoonrise * 60)}m`
          : `${Math.round(hoursUntilMoonrise)}h`,
        nextFullMoon: daysUntilFull === 0 ? 'Today' : `${daysUntilFull} ${daysUntilFull === 1 ? 'Day' : 'Days'}`
      };
      
      logger.info(`✅ Moon data calculated: ${illumination}% illuminated`);
      return moonData;
      
    } catch (error: any) {
      logger.error(`❌ Moon data calculation error: ${error.message}`);
      return {
        illumination: 0,
        moonriseIn: 'N/A',
        nextFullMoon: 'N/A'
      };
    }
  }
}

export default new WeatherService();
