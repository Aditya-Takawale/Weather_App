// Weather API Constants
export const WEATHER_CONSTANTS = {
  DEFAULT_CITY: 'Pune',
  API_BASE_URL: process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5',
  CACHE_DURATION: 300, // 5 minutes in seconds
  HISTORICAL_LIMIT: 100
};

// Alert Thresholds
export const ALERT_THRESHOLDS = {
  HIGH_TEMPERATURE: 35, // Celsius
  LOW_TEMPERATURE: 5,
  HIGH_WIND_SPEED: 50, // km/h
  HIGH_HUMIDITY: 90, // percentage
  LOW_VISIBILITY: 1000 // meters
};

// Database Constants
export const DB_CONSTANTS = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // milliseconds
  CONNECTION_TIMEOUT: 30000
};

// Cron Job Schedules
export const CRON_SCHEDULES = {
  DATA_FETCH: '*/5 * * * *', // Every 5 minutes
  DASHBOARD_UPDATE: '*/10 * * * *', // Every 10 minutes
  ALERT_CHECK: '* * * * *', // Every minute
  DATA_CLEANUP: '0 0 * * *' // Daily at midnight
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

export default {
  WEATHER_CONSTANTS,
  ALERT_THRESHOLDS,
  DB_CONSTANTS,
  CRON_SCHEDULES,
  HTTP_STATUS,
  PAGINATION
};
