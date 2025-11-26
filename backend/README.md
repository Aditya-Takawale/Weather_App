# Weather Dashboard Backend

Node.js + Express + MongoDB backend for the Weather Monitoring System.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # MongoDB connection
│   │   ├── logger.js    # Winston logger setup
│   │   └── env.js       # Environment variables
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   │   ├── weatherRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── alertRoutes.js
│   ├── services/        # Business logic
│   ├── jobs/            # Cron jobs
│   │   ├── cronScheduler.js
│   │   ├── dataFetchJob.js
│   │   ├── dashboardUpdateJob.js
│   │   ├── dataCleanupJob.js
│   │   └── alertCheckJob.js
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Helper functions
│   └── server.js        # Application entry point
├── logs/                # Application logs
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment template
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 6.0
- OpenWeatherMap API Key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - Add your OpenWeatherMap API key
   - Configure MongoDB connection string
   - Adjust cron schedules if needed

### Running the Application

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 🔧 Environment Variables

See `.env.example` for all available configuration options.

### Required Variables
- `OPENWEATHER_API_KEY` - Your OpenWeatherMap API key

### Optional Variables
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `CRON_*` - Cron schedule expressions
- `ALERT_*` - Alert threshold values

## 📊 API Endpoints

### Health Check
- `GET /health` - Server health status

### Weather Data
- `GET /api/weather/current` - Current weather data
- `GET /api/weather/history` - Historical weather data

### Dashboard
- `GET /api/dashboard/summary` - Pre-aggregated dashboard data (⚡ High Performance)
- `GET /api/dashboard/trends` - Hourly trends data

### Alerts
- `GET /api/alerts/active` - Active weather alerts
- `GET /api/alerts/history` - Alert history with pagination
- `GET /api/alerts/config` - Current alert configuration
- `PUT /api/alerts/config` - Update alert thresholds

## ⏰ Cron Jobs

The system runs four automated jobs:

1. **Data Fetching** (Every 30 min) - Fetch weather data from API
2. **Dashboard Update** (Hourly) - Compute summary statistics
3. **Data Cleanup** (Daily) - Remove old data (>2 days)
4. **Alert Check** (Every 15 min) - Check thresholds and create alerts

## 📝 Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## 🧪 Testing

Run tests:
```bash
npm test
```

## 📚 Next Steps

1. Implement Mongoose models based on SCHEMA_DESIGN.md
2. Implement cron job logic
3. Implement API endpoint controllers
4. Add unit tests
5. Add API documentation (Swagger/OpenAPI)
