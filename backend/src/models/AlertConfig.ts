import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICondition {
  parameter: 'temperature' | 'humidity' | 'weatherCondition' | 'windSpeed' | 'pressure' | 'visibility';
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains' | 'not_contains';
  value: number | string;
  unit?: string;
}

export interface IAlertConfigSettings {
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  messageTemplate: string;
  notificationChannels: string[];
  cooldownMinutes: number;
}

export interface IAlertConfig extends Document {
  userId?: string;
  city: string;
  ruleName: string;
  conditions: ICondition[];
  logicOperator: 'AND' | 'OR';
  alertConfig: IAlertConfigSettings;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  evaluate(weatherData: any): boolean;
  generateMessage(weatherData: any): string;
}

interface IAlertConfigModel extends Model<IAlertConfig> {
  getEnabledRules(city?: string, userId?: string | null): Promise<IAlertConfig[]>;
}

const conditionSchema = new Schema<ICondition>({
  parameter: {
    type: String,
    required: true,
    enum: ['temperature', 'humidity', 'weatherCondition', 'windSpeed', 'pressure', 'visibility']
  },
  operator: {
    type: String,
    required: true,
    enum: ['>', '<', '>=', '<=', '==', '!=', 'contains', 'not_contains']
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  },
  unit: String
}, { _id: false });

const alertConfigSchema = new Schema<IAlertConfig>({
  userId: {
    type: String,
    index: true
  },
  city: {
    type: String,
    required: true,
    index: true,
    default: 'Pune'
  },
  ruleName: {
    type: String,
    required: true
  },
  conditions: {
    type: [conditionSchema],
    required: true,
    validate: {
      validator: function(arr: ICondition[]) {
        return arr.length > 0;
      },
      message: 'At least one condition is required'
    }
  },
  logicOperator: {
    type: String,
    enum: ['AND', 'OR'],
    default: 'AND'
  },
  alertConfig: {
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'WARNING'
    },
    messageTemplate: {
      type: String,
      required: true
    },
    notificationChannels: {
      type: [String],
      enum: ['email', 'sms', 'push', 'console'],
      default: ['console']
    },
    cooldownMinutes: {
      type: Number,
      default: 15,
      min: 1,
      max: 1440
    }
  },
  isEnabled: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes
alertConfigSchema.index({ city: 1, isEnabled: 1 });
alertConfigSchema.index({ userId: 1, city: 1, isEnabled: 1 });

// Static method to get enabled rules for a city
alertConfigSchema.statics.getEnabledRules = function(city = 'Pune', userId: string | null = null) {
  const query: any = { city, isEnabled: true };
  if (userId) {
    query.$or = [
      { userId },
      { userId: { $exists: false } }
    ];
  }
  return this.find(query).exec();
};

// Instance method to evaluate rule against weather data
alertConfigSchema.methods.evaluate = function(this: IAlertConfig, weatherData: any) {
  const results = this.conditions.map(condition => {
    return evaluateCondition(condition, weatherData);
  });
  
  if (this.logicOperator === 'AND') {
    return results.every(result => result === true);
  } else {
    return results.some(result => result === true);
  }
};

// Helper function to evaluate a single condition
function evaluateCondition(condition: ICondition, weatherData: any): boolean {
  const actualValue = weatherData[condition.parameter];
  const thresholdValue = condition.value;
  
  switch (condition.operator) {
    case '>':
      return actualValue > thresholdValue;
    case '<':
      return actualValue < thresholdValue;
    case '>=':
      return actualValue >= thresholdValue;
    case '<=':
      return actualValue <= thresholdValue;
    case '==':
      return actualValue == thresholdValue;
    case '!=':
      return actualValue != thresholdValue;
    case 'contains':
      return String(actualValue).toLowerCase().includes(String(thresholdValue).toLowerCase());
    case 'not_contains':
      return !String(actualValue).toLowerCase().includes(String(thresholdValue).toLowerCase());
    default:
      return false;
  }
}

// Instance method to generate alert message from template
alertConfigSchema.methods.generateMessage = function(this: IAlertConfig, weatherData: any) {
  let message = this.alertConfig.messageTemplate;
  
  Object.keys(weatherData).forEach(key => {
    const placeholder = `{${key}}`;
    if (message.includes(placeholder)) {
      message = message.replace(new RegExp(placeholder, 'g'), weatherData[key]);
    }
  });
  
  return message;
};

const AlertConfig = mongoose.model<IAlertConfig, IAlertConfigModel>('AlertConfig', alertConfigSchema);

export default AlertConfig;
