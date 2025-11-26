# MongoDB Schema Design for Weather Monitoring System

## Overview
This document outlines the MongoDB schema design for three critical collections optimized for performance and data integrity.

---

## 1️⃣ Raw Weather Data Collection (`rawWeatherData`)

### Purpose
Stores raw weather data fetched from OpenWeatherMap API every 30 minutes for Pune.

### Schema Structure
```javascript
{
  _id: ObjectId,
  city: String,              // "Pune"
  timestamp: Date,           // ISO 8601 format
  temperature: Number,       // Celsius
  feelsLike: Number,         // Celsius
  humidity: Number,          // Percentage
  pressure: Number,          // hPa
  windSpeed: Number,         // m/s
  windDirection: Number,     // Degrees
  weatherCondition: String,  // "Clear", "Rain", "Storm", etc.
  weatherDescription: String,// Detailed description
  visibility: Number,        // Meters
  cloudiness: Number,        // Percentage
  sunrise: Date,             // ISO 8601
  sunset: Date,              // ISO 8601
  isDeleted: Boolean,        // For soft delete (default: false)
  deletedAt: Date,           // Timestamp of deletion
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

### Indexes
```javascript
// Primary index for time-based queries
{ timestamp: -1 }

// Compound index for city-specific queries
{ city: 1, timestamp: -1 }

// Index for cleanup job (TTL or manual cleanup)
{ isDeleted: 1, deletedAt: 1 }

// Index for alert detection
{ timestamp: -1, temperature: 1, humidity: 1, weatherCondition: 1 }
```

### Performance Considerations
- **TTL Index Option**: Can set `expireAfterSeconds: 172800` (2 days) on `timestamp` field
- **Soft Delete**: Use `isDeleted` flag for data recovery and auditing
- **Data Retention**: Keep only 2 days of data for optimal performance

---

## 2️⃣ Dashboard Summary Data Collection (`dashboardSummary`)

### Purpose
Pre-aggregated summary data computed hourly for fast dashboard rendering.

### Schema Structure
```javascript
{
  _id: ObjectId,
  city: String,                    // "Pune"
  summaryDate: Date,               // Date of summary (start of day)
  computedAt: Date,                // When this summary was generated
  
  // Current/Latest Metrics (from most recent raw data)
  current: {
    temperature: Number,
    feelsLike: Number,
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    weatherCondition: String,
    weatherDescription: String,
    timestamp: Date
  },
  
  // Today's Aggregated Metrics
  today: {
    avgTemperature: Number,
    minTemperature: Number,
    maxTemperature: Number,
    avgHumidity: Number,
    avgPressure: Number,
    avgWindSpeed: Number,
    dominantWeather: String,       // Most frequent weather condition
    dataPointsCount: Number        // Number of raw records processed
  },
  
  // 24-Hour Trend Data (for line charts)
  hourlyTrends: [
    {
      hour: Date,                  // Rounded to hour
      avgTemperature: Number,
      avgHumidity: Number,
      avgPressure: Number,
      weatherCondition: String
    }
  ],
  
  // 48-Hour Historical Comparison
  yesterday: {
    avgTemperature: Number,
    maxTemperature: Number,
    minTemperature: Number
  },
  
  // Statistics
  stats: {
    temperatureVariance: Number,
    humidityRange: Number,
    weatherChangeCount: Number     // How many times weather changed
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
// Primary lookup index for dashboard
{ city: 1, summaryDate: -1 }

// Index for latest summary
{ city: 1, computedAt: -1 }

// Compound index for date range queries
{ summaryDate: -1, computedAt: -1 }
```

### Performance Considerations
- **Single Document per Day**: Store one summary document per day, updated hourly
- **Embedded Arrays**: `hourlyTrends` array limited to 48 entries max
- **Pre-computed**: All calculations done during Cron Job 2
- **Dashboard API**: Simple find query with no aggregation needed

---

## 3️⃣ Alert Logs Collection (`alertLogs`)

### Purpose
Stores weather alerts generated every 15 minutes based on threshold violations.

### Schema Structure
```javascript
{
  _id: ObjectId,
  city: String,                    // "Pune"
  alertType: String,               // "HIGH_TEMP", "HIGH_HUMIDITY", "EXTREME_WEATHER"
  severity: String,                // "WARNING", "CRITICAL"
  message: String,                 // Human-readable alert message
  
  // Threshold Information
  threshold: {
    parameter: String,             // "temperature", "humidity", "weatherCondition"
    operator: String,              // ">", "<", "==", "contains"
    value: Number/String,          // Threshold value
    unit: String                   // "°C", "%", etc.
  },
  
  // Actual Values
  actualValue: {
    temperature: Number,
    humidity: Number,
    weatherCondition: String,
    timestamp: Date                // When the violation occurred
  },
  
  // Alert Metadata
  isActive: Boolean,               // True if condition still exists
  resolvedAt: Date,                // When condition cleared
  notificationSent: Boolean,       // Email/SMS sent flag
  notificationChannel: [String],   // ["email", "sms", "push"]
  
  // User Configuration Reference
  userId: String,                  // If user-specific thresholds exist
  ruleId: String,                  // Reference to alert rule
  
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
// Primary query index for recent alerts
{ city: 1, createdAt: -1 }

// Index for active alerts
{ city: 1, isActive: 1, createdAt: -1 }

// Index for alert type filtering
{ alertType: 1, createdAt: -1 }

// Index for resolution tracking
{ isActive: 1, resolvedAt: 1 }

// Compound index for user-specific alerts
{ userId: 1, city: 1, createdAt: -1 }
```

### Performance Considerations
- **Pagination**: Implement cursor-based pagination for alert history
- **Active Alerts**: Quick lookup with `isActive: true` index
- **Retention**: Archive alerts older than 30 days
- **Deduplication**: Check if similar alert exists in last 15 minutes before creating

---

## 4️⃣ Alert Configuration Collection (`alertConfig`) - Bonus

### Purpose
Store user-defined threshold rules for flexibility.

### Schema Structure
```javascript
{
  _id: ObjectId,
  userId: String,                  // Optional for user-specific rules
  city: String,                    // "Pune"
  ruleName: String,                // "High Temperature Alert"
  
  conditions: [
    {
      parameter: String,           // "temperature", "humidity", etc.
      operator: String,            // ">", "<", ">=", "<=", "=="
      value: Number/String,
      unit: String
    }
  ],
  
  logicOperator: String,           // "AND", "OR" for multiple conditions
  
  alertConfig: {
    severity: String,              // "WARNING", "CRITICAL"
    messageTemplate: String,       // "Temperature exceeded {value}°C"
    notificationChannels: [String],// ["email", "sms"]
    cooldownMinutes: Number        // Minimum time between duplicate alerts
  },
  
  isEnabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔍 Summary & Rationale

### Key Design Decisions

1. **Raw Data Retention**: 2-day window with soft delete for recovery
2. **Pre-aggregation**: Dashboard summary computed hourly for instant API response
3. **Indexing Strategy**: Optimized for time-series queries and dashboard lookups
4. **Embedded Documents**: Used for related data (current, today, yesterday) to reduce joins
5. **Alert Deduplication**: Prevents spam with active flag and cooldown logic

### Performance Benefits

- **Dashboard Load Time**: < 100ms (single indexed query, no aggregation)
- **Cron Job Efficiency**: Indexes optimized for time-range scans
- **Storage Optimization**: Auto-cleanup of old data
- **Scalability**: Can easily extend to multiple cities with minimal schema changes

### Next Steps
1. Implement Mongoose models based on these schemas
2. Create database connection and initialization script
3. Add data validation middleware
4. Implement backup strategy for critical alert data
