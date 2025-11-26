import dotenv from 'dotenv';
dotenv.config();

/**
 * Environment Configuration
 * Centralizes all environment variables with validation
 */

interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  openWeather: {
    apiKey: string;
    apiUrl: string;
    city: string;
    countryCode: string;
  };
  cronSchedules: {
    dataFetch: string;
    dashboardUpdate: string;
    dataCleanup: string;
    alertCheck: string;
  };
  alerts: {
    highTempThreshold: number;
    highHumidityThreshold: number;
    extremeWeatherConditions: string[];
  };
  dataRetentionDays: number;
  corsOrigin: string;
  logLevel: string;
}

const config: Config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/weather_dashboard',
  
  // OpenWeatherMap API
  openWeather: {
    apiKey: process.env.OPENWEATHER_API_KEY || '',
    apiUrl: process.env.OPENWEATHER_API_URL || 'https://api.openweathermap.org/data/2.5/weather',
    city: process.env.WEATHER_CITY || 'Pune',
    countryCode: process.env.WEATHER_COUNTRY_CODE || 'IN'
  },
  
  // Cron Schedules
  cronSchedules: {
    dataFetch: process.env.CRON_DATA_FETCH || '*/30 * * * *',      // Every 30 minutes
    dashboardUpdate: process.env.CRON_DASHBOARD_UPDATE || '0 * * * *', // Every hour
    dataCleanup: process.env.CRON_DATA_CLEANUP || '0 0 * * *',     // Daily at midnight
    alertCheck: process.env.CRON_ALERT_CHECK || '*/15 * * * *'     // Every 15 minutes
  },
  
  // Alert Thresholds
  alerts: {
    highTempThreshold: parseFloat(process.env.ALERT_HIGH_TEMP_THRESHOLD || '35'),
    highHumidityThreshold: parseFloat(process.env.ALERT_HIGH_HUMIDITY_THRESHOLD || '80'),
    extremeWeatherConditions: process.env.ALERT_EXTREME_WEATHER?.split(',') || 
      ['Storm', 'Thunderstorm', 'Hurricane', 'Tornado']
  },
  
  // Data Retention
  dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS || '2', 10),
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};

/**
 * Validate required environment variables
 */
const validateConfig = (): void => {
  const requiredVars = ['OPENWEATHER_API_KEY'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('💡 Please create a .env file based on .env.example');
    process.exit(1);
  }
};

export { config, validateConfig };
