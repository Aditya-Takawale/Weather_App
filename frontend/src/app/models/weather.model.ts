export interface WeatherData {
  _id: string;
  city: string;
  timestamp: Date;
  coordinates: {
    lon: number;
    lat: number;
  };
  weatherId: number;
  weatherMain: string;
  weatherDescription: string;
  weatherIcon: string;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  pressure: number;
  humidity: number;
  seaLevel?: number;
  groundLevel?: number;
  windSpeed: number;
  windDirection: number;
  windGust?: number;
  cloudiness: number;
  visibility: number;
  country: string;
  sunrise: number;
  sunset: number;
  dt: number;
  timezone: number;
}

export interface DashboardSummary {
  city: string;
  summaryDate: Date;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    weatherCondition: string;
    weatherDescription: string;
    timestamp: Date;
  };
  today: {
    avgTemperature: number;
    minTemperature: number;
    maxTemperature: number;
    avgHumidity: number;
    avgPressure: number;
    avgWindSpeed: number;
    dominantWeather: string;
    dataPointsCount: number;
  };
  hourlyTrends: Array<{
    hour: Date;
    avgTemperature: number;
    avgHumidity: number;
    avgPressure: number;
    weatherCondition: string;
  }>;
  yesterday: {
    avgTemperature: number;
    maxTemperature: number;
    minTemperature: number;
  };
  stats: {
    temperatureVariance: number;
    humidityRange: number;
    weatherChangeCount: number;
  };
}

export interface Alert {
  _id: string;
  city: string;
  alertType: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  threshold: any;
  actualValue: any;
  isActive: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
