// Dashboard Constants
export const DASHBOARD_CONSTANTS = {
  DEFAULT_CITY: 'Pune',
  REFRESH_INTERVAL: 300000, // 5 minutes
  DEFAULT_PAGE_SIZE: 10,
  MAP_LAYERS: ['alerts', 'temperature', 'precipitation', 'wind']
};

// Weather Constants
export const WEATHER_CONSTANTS = {
  TEMPERATURE_UNIT: 'celsius',
  WIND_SPEED_UNIT: 'kmph',
  PRESSURE_UNIT: 'hPa',
  DEFAULT_LIMIT: 50
};

// Alert Constants
export const ALERT_CONSTANTS = {
  SEVERITY_LEVELS: ['low', 'medium', 'high', 'critical'],
  ALERT_TYPES: ['weather', 'temperature', 'wind', 'precipitation'],
  DEFAULT_ALERT_LIMIT: 50
};

// API Response Constants
export const API_CONSTANTS = {
  SUCCESS_STATUS: 200,
  ERROR_STATUS: 500,
  UNAUTHORIZED_STATUS: 401,
  NOT_FOUND_STATUS: 404
};

// Date Format Constants
export const DATE_FORMAT_CONSTANTS = {
  DISPLAY_FORMAT: 'MMM dd, yyyy',
  TIME_FORMAT: 'hh:mm a',
  DATE_TIME_FORMAT: 'MMM dd, yyyy hh:mm a',
  ISO_FORMAT: 'yyyy-MM-ddTHH:mm:ss'
};

// Chart Constants
export const CHART_CONSTANTS = {
  DEFAULT_CHART_HEIGHT: 300,
  DEFAULT_CHART_WIDTH: 600,
  CHART_COLORS: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
};

// Export all constants
export default {
  DASHBOARD_CONSTANTS,
  WEATHER_CONSTANTS,
  ALERT_CONSTANTS,
  API_CONSTANTS,
  DATE_FORMAT_CONSTANTS,
  CHART_CONSTANTS
};
