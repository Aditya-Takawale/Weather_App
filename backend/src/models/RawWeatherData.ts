import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Raw Weather Data Schema - Based on OpenWeatherMap API Response
 * Stores weather data fetched from OpenWeatherMap API every 30 minutes
 * 
 * API Response Structure:
 * - coord: {lon, lat}
 * - weather: [{id, main, description, icon}]
 * - main: {temp, feels_like, temp_min, temp_max, pressure, humidity, sea_level, grnd_level}
 * - wind: {speed, deg, gust}
 * - clouds: {all}
 * - visibility: number
 * - sys: {sunrise, sunset, country}
 * - dt: Unix timestamp
 */

export interface ICoordinates {
  lon: number;
  lat: number;
}

export interface IRawWeatherData extends Document {
  city: string;
  timestamp: Date;
  
  // Coordinates
  coordinates: ICoordinates;
  
  // Weather information
  weatherId: number;
  weatherMain: string;
  weatherDescription: string;
  weatherIcon: string;
  
  // Main temperature and pressure data
  temperature: number;          // in Celsius (API called with units=metric)
  feelsLike: number;            // in Celsius
  tempMin: number;              // in Celsius
  tempMax: number;              // in Celsius
  pressure: number;             // hPa (hectopascals)
  humidity: number;             // percentage
  seaLevel?: number;            // hPa
  groundLevel?: number;         // hPa
  
  // Wind data
  windSpeed: number;            // km/h (converted from m/s)
  windDirection: number;        // degrees (0-360)
  windGust?: number;            // km/h (converted from m/s)
  
  // Additional data
  cloudiness: number;           // percentage
  visibility: number;           // meters
  
  // System data
  country: string;
  sunrise: Date;
  sunset: Date;
  
  // API metadata
  dt: number;                   // Unix timestamp from API
  timezone: number;             // Timezone offset
  
  // Soft delete fields
  isDeleted: boolean;
  deletedAt?: Date;
  
  // Auto-generated timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  softDelete(): Promise<IRawWeatherData>;
  readonly isStale: boolean;
}

interface IRawWeatherDataModel extends Model<IRawWeatherData> {
  findActive(query?: Record<string, any>): any; // Returns Query, not Promise
  getLatest(city?: string): Promise<IRawWeatherData | null>;
  getByTimeRange(city: string, startDate: Date, endDate: Date): Promise<IRawWeatherData[]>;
}

const coordinatesSchema = new Schema<ICoordinates>({
  lon: { type: Number, required: true },
  lat: { type: Number, required: true }
}, { _id: false });

const rawWeatherDataSchema = new Schema<IRawWeatherData>({
  city: {
    type: String,
    required: true,
    index: true,
    default: 'Pune'
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  
  // Coordinates
  coordinates: {
    type: coordinatesSchema,
    required: true
  },
  
  // Weather information
  weatherId: {
    type: Number,
    required: true
  },
  weatherMain: {
    type: String,
    required: true,
    index: true
  },
  weatherDescription: {
    type: String,
    required: true
  },
  weatherIcon: {
    type: String,
    required: true
  },
  
  // Main data
  temperature: {
    type: Number,
    required: true
  },
  feelsLike: {
    type: Number,
    required: true
  },
  tempMin: {
    type: Number,
    required: true
  },
  tempMax: {
    type: Number,
    required: true
  },
  pressure: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  seaLevel: {
    type: Number
  },
  groundLevel: {
    type: Number
  },
  
  // Wind data
  windSpeed: {
    type: Number,
    required: true
  },
  windDirection: {
    type: Number,
    required: true,
    min: 0,
    max: 360
  },
  windGust: {
    type: Number
  },
  
  // Additional data
  cloudiness: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  visibility: {
    type: Number,
    required: true
  },
  
  // System data
  country: {
    type: String,
    required: true
  },
  sunrise: {
    type: Date,
    required: true
  },
  sunset: {
    type: Date,
    required: true
  },
  
  // API metadata
  dt: {
    type: Number,
    required: true
  },
  timezone: {
    type: Number,
    required: true
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for optimized queries
rawWeatherDataSchema.index({ city: 1, timestamp: -1 });
rawWeatherDataSchema.index({ timestamp: -1, temperature: 1, humidity: 1, weatherMain: 1 });
rawWeatherDataSchema.index({ isDeleted: 1, deletedAt: 1 });

// TTL index option - uncomment to auto-delete records after 2 days
// rawWeatherDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 172800 });

// Virtual for checking if data is stale (older than 1 hour)
rawWeatherDataSchema.virtual('isStale').get(function(this: IRawWeatherData) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.timestamp < oneHourAgo;
});

// Instance method for soft delete
rawWeatherDataSchema.methods.softDelete = function(this: IRawWeatherData) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Static method to find active (non-deleted) records
rawWeatherDataSchema.statics.findActive = function(query: Record<string, any> = {}) {
  return this.find({ ...query, isDeleted: false });
};

// Static method to get latest weather data
rawWeatherDataSchema.statics.getLatest = function(city = 'Pune') {
  return this.findOne({ city, isDeleted: false })
    .sort({ timestamp: -1 })
    .exec();
};

// Static method to get weather data within time range
rawWeatherDataSchema.statics.getByTimeRange = function(city: string, startDate: Date, endDate: Date) {
  return this.find({
    city,
    isDeleted: false,
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: -1 }).exec();
};

const RawWeatherData = mongoose.model<IRawWeatherData, IRawWeatherDataModel>('RawWeatherData', rawWeatherDataSchema);

export default RawWeatherData;
