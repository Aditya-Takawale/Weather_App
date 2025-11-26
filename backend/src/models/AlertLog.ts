import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IThreshold {
  parameter: 'temperature' | 'humidity' | 'weatherCondition' | 'windSpeed' | 'pressure';
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains';
  value: number | string;
  unit?: string;
}

export interface IActualValue {
  temperature?: number;
  humidity?: number;
  weatherCondition?: string;
  windSpeed?: number;
  pressure?: number;
  timestamp: Date;
}

export interface IAlertLog extends Document {
  city: string;
  alertType: 'HIGH_TEMP' | 'LOW_TEMP' | 'HIGH_HUMIDITY' | 'LOW_HUMIDITY' | 'EXTREME_WEATHER' | 'HIGH_WIND' | 'CUSTOM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  threshold: IThreshold;
  actualValue: IActualValue;
  isActive: boolean;
  resolvedAt?: Date;
  notificationSent: boolean;
  notificationChannel: string[];
  userId?: string;
  ruleId?: string;
  createdAt: Date;
  updatedAt: Date;
  resolve(): Promise<IAlertLog>;
}

interface IAlertLogModel extends Model<IAlertLog> {
  getActive(city?: string, limit?: number): Promise<IAlertLog[]>;
  getRecent(city?: string, page?: number, limit?: number): Promise<IAlertLog[]>;
  hasDuplicateRecent(city: string, alertType: string, cooldownMinutes?: number): Promise<boolean>;
  createIfNotDuplicate(alertData: Partial<IAlertLog>, cooldownMinutes?: number): Promise<IAlertLog | null>;
}

const thresholdSchema = new Schema<IThreshold>({
  parameter: {
    type: String,
    required: true,
    enum: ['temperature', 'humidity', 'weatherCondition', 'windSpeed', 'pressure']
  },
  operator: {
    type: String,
    required: true,
    enum: ['>', '<', '>=', '<=', '==', '!=', 'contains']
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  },
  unit: String
}, { _id: false });

const actualValueSchema = new Schema<IActualValue>({
  temperature: Number,
  humidity: Number,
  weatherCondition: String,
  windSpeed: Number,
  pressure: Number,
  timestamp: {
    type: Date,
    required: true
  }
}, { _id: false });

const alertLogSchema = new Schema<IAlertLog>({
  city: {
    type: String,
    required: true,
    index: true,
    default: 'Pune'
  },
  alertType: {
    type: String,
    required: true,
    enum: ['HIGH_TEMP', 'LOW_TEMP', 'HIGH_HUMIDITY', 'LOW_HUMIDITY', 'EXTREME_WEATHER', 'HIGH_WIND', 'CUSTOM'],
    index: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'WARNING'
  },
  message: {
    type: String,
    required: true
  },
  threshold: {
    type: thresholdSchema,
    required: true
  },
  actualValue: {
    type: actualValueSchema,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  resolvedAt: {
    type: Date
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationChannel: {
    type: [String],
    enum: ['email', 'sms', 'push', 'console'],
    default: ['console']
  },
  userId: {
    type: String,
    index: true
  },
  ruleId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes
alertLogSchema.index({ city: 1, createdAt: -1 });
alertLogSchema.index({ city: 1, isActive: 1, createdAt: -1 });
alertLogSchema.index({ alertType: 1, createdAt: -1 });
alertLogSchema.index({ isActive: 1, resolvedAt: 1 });
alertLogSchema.index({ userId: 1, city: 1, createdAt: -1 });

// Instance method to resolve an alert
alertLogSchema.methods.resolve = function(this: IAlertLog) {
  this.isActive = false;
  this.resolvedAt = new Date();
  return this.save();
};

// Static methods
alertLogSchema.statics.getActive = function(city = 'Pune', limit = 10) {
  return this.find({ city, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

alertLogSchema.statics.getRecent = function(city = 'Pune', page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ city })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

alertLogSchema.statics.hasDuplicateRecent = async function(city: string, alertType: string, cooldownMinutes = 15) {
  const cooldownTime = new Date(Date.now() - cooldownMinutes * 60 * 1000);
  
  const duplicate = await this.findOne({
    city,
    alertType,
    isActive: true,
    createdAt: { $gte: cooldownTime }
  }).exec();
  
  return !!duplicate;
};

alertLogSchema.statics.createIfNotDuplicate = async function(alertData: Partial<IAlertLog>, cooldownMinutes = 15) {
  // Cast this to IAlertLogModel to access custom static methods
  const model = this as unknown as IAlertLogModel;
  const isDuplicate = await model.hasDuplicateRecent(
    alertData.city!,
    alertData.alertType!,
    cooldownMinutes
  );
  
  if (isDuplicate) {
    return null;
  }
  
  return this.create(alertData);
};

const AlertLog = mongoose.model<IAlertLog, IAlertLogModel>('AlertLog', alertLogSchema);

export default AlertLog;
