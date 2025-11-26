import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Dashboard Summary Schema
 * Pre-aggregated summary data computed hourly for fast dashboard rendering
 */

export interface IHourlyTrend {
  hour: Date;
  avgTemperature?: number;
  avgHumidity?: number;
  avgPressure?: number;
  weatherCondition?: string;
}

export interface ICurrentData {
  temperature?: number;
  feelsLike?: number;
  humidity?: number;
  pressure?: number;
  windSpeed?: number;
  weatherCondition?: string;
  weatherDescription?: string;
  timestamp?: Date;
}

export interface ITodayData {
  avgTemperature?: number;
  minTemperature?: number;
  maxTemperature?: number;
  avgHumidity?: number;
  avgPressure?: number;
  avgWindSpeed?: number;
  dominantWeather?: string;
  dataPointsCount?: number;
}

export interface IYesterdayData {
  avgTemperature?: number;
  maxTemperature?: number;
  minTemperature?: number;
}

export interface IStats {
  temperatureVariance?: number;
  humidityRange?: number;
  weatherChangeCount?: number;
}

export interface IDashboardSummary extends Document {
  city: string;
  summaryDate: Date;
  computedAt: Date;
  current: ICurrentData;
  today: ITodayData;
  hourlyTrends: IHourlyTrend[];
  yesterday?: IYesterdayData;
  stats?: IStats;
  createdAt: Date;
  updatedAt: Date;
}

interface IDashboardSummaryModel extends Model<IDashboardSummary> {
  getLatest(city?: string): Promise<IDashboardSummary | null>;
  getToday(city?: string): Promise<IDashboardSummary | null>;
  upsertSummary(city: string, summaryDate: Date, data: Partial<IDashboardSummary>): Promise<IDashboardSummary>;
}

const hourlyTrendSchema = new Schema<IHourlyTrend>({
  hour: {
    type: Date,
    required: true
  },
  avgTemperature: Number,
  avgHumidity: Number,
  avgPressure: Number,
  weatherCondition: String
}, { _id: false });

const currentDataSchema = new Schema<ICurrentData>({
  temperature: Number,
  feelsLike: Number,
  humidity: Number,
  pressure: Number,
  windSpeed: Number,
  weatherCondition: String,
  weatherDescription: String,
  timestamp: Date
}, { _id: false });

const todayDataSchema = new Schema<ITodayData>({
  avgTemperature: Number,
  minTemperature: Number,
  maxTemperature: Number,
  avgHumidity: Number,
  avgPressure: Number,
  avgWindSpeed: Number,
  dominantWeather: String,
  dataPointsCount: Number
}, { _id: false });

const yesterdayDataSchema = new Schema<IYesterdayData>({
  avgTemperature: Number,
  maxTemperature: Number,
  minTemperature: Number
}, { _id: false });

const statsSchema = new Schema<IStats>({
  temperatureVariance: Number,
  humidityRange: Number,
  weatherChangeCount: Number
}, { _id: false });

const dashboardSummarySchema = new Schema<IDashboardSummary>({
  city: {
    type: String,
    required: true,
    index: true,
    default: 'Pune'
  },
  summaryDate: {
    type: Date,
    required: true,
    index: true
  },
  computedAt: {
    type: Date,
    required: true,
    index: true,
    default: Date.now
  },
  current: {
    type: currentDataSchema,
    required: true
  },
  today: {
    type: todayDataSchema,
    required: true
  },
  hourlyTrends: {
    type: [hourlyTrendSchema],
    validate: {
      validator: function(arr) {
        return arr.length <= 48; // Max 48 hours of data
      },
      message: 'Hourly trends cannot exceed 48 entries'
    }
  },
  yesterday: yesterdayDataSchema,
  stats: statsSchema
}, {
  timestamps: true
});

// Compound indexes for optimized dashboard queries
dashboardSummarySchema.index({ city: 1, summaryDate: -1 });
dashboardSummarySchema.index({ city: 1, computedAt: -1 });
dashboardSummarySchema.index({ summaryDate: -1, computedAt: -1 });

// Static method to get latest summary
dashboardSummarySchema.statics.getLatest = function(city = 'Pune') {
  return this.findOne({ city })
    .sort({ computedAt: -1 })
    .exec();
};

// Static method to get today's summary
dashboardSummarySchema.statics.getToday = function(city = 'Pune') {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  return this.findOne({
    city,
    summaryDate: { $gte: startOfDay }
  })
  .sort({ computedAt: -1 })
  .exec();
};

// Static method to upsert (update or insert) summary
dashboardSummarySchema.statics.upsertSummary = function(city: string, summaryDate: Date, data: Partial<IDashboardSummary>) {
  const startOfDay = new Date(summaryDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  return this.findOneAndUpdate(
    { city, summaryDate: startOfDay },
    { 
      ...data,
      city,
      summaryDate: startOfDay,
      computedAt: new Date()
    },
    { 
      upsert: true, 
      new: true,
      runValidators: true
    }
  ).exec();
};

const DashboardSummary = mongoose.model<IDashboardSummary, IDashboardSummaryModel>('DashboardSummary', dashboardSummarySchema);

export default DashboardSummary;
