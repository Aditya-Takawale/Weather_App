# Weather Monitoring and Automation System

A robust weather monitoring system built with **Angular** (frontend), **Node.js/Express** (backend), **MongoDB** (database), and **OpenWeatherMap API**.

## 🌟 Features

- **Real-time Weather Data**: Fetches weather data from OpenWeatherMap API every 30 minutes
- **Pre-aggregated Dashboard**: Hourly dashboard updates for optimal performance
- **Smart Alerts**: Customizable weather alert system with threshold monitoring
- **Data Management**: Automatic cleanup with soft delete and retention policies
- **Cron Jobs**: 4 scheduled jobs for automation
  - Data Fetching (30 min intervals)
  - Dashboard Updates (hourly)
  - Data Cleanup (daily)
  - Alert Monitoring (15 min intervals)

## 🏗️ Architecture

### Backend (Node.js + TypeScript + Express)
- **Models**: Mongoose schemas for RawWeatherData, DashboardSummary, AlertLog, AlertConfig
- **Services**: WeatherService (API integration), DashboardService (aggregation)
- **Jobs**: 4 cron jobs for automation
- **API Routes**: RESTful endpoints for weather, dashboard, and alerts

### Frontend (Angular - Coming Soon)
- Material Design UI
- Real-time dashboard with charts
- Alert management interface

### Database (MongoDB)
- Optimized indexes for performance
- Time-series data storage
- Aggregation pipeline for summaries

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- OpenWeatherMap API key

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/weather_dashboard
OPENWEATHER_API_KEY=your_api_key_here
OPENWEATHER_CITY=Pune
OPENWEATHER_COUNTRY_CODE=IN
```

Run the backend:
```bash
npm run dev      # Development
npm run build    # Build for production
npm start        # Production
```

## 📊 API Endpoints

### Weather
- `GET /api/weather/current` - Current weather data
- `GET /api/weather/history` - Historical data

### Dashboard
- `GET /api/dashboard/summary` - Pre-aggregated dashboard data
- `GET /api/dashboard/trends` - 48-hour hourly trends

### Alerts
- `GET /api/alerts/active` - Active alerts
- `GET /api/alerts/history` - Alert history
- `GET /api/alerts/config` - Alert configuration
- `PUT /api/alerts/config` - Update alert thresholds

## 🛠️ Technology Stack

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- node-cron (scheduling)
- Winston (logging)
- Axios (HTTP client)

**Frontend:**
- Angular 17+
- Angular Material
- RxJS
- Chart.js

## 📝 Environment Variables

See `backend/.env.example` for all available configuration options.

## 🔧 Development

### TypeScript Compilation
```bash
npm run build        # Compile TypeScript
npm run build:watch  # Watch mode
```

### Linting
```bash
npm run lint
```

## 📈 Performance Optimization

- Pre-aggregated dashboard summaries (computed hourly)
- Indexed MongoDB queries
- Soft delete with scheduled hard delete
- Efficient cron job scheduling

## 🎯 Project Status

✅ **Completed:**
- MongoDB schema design (4 collections)
- TypeScript backend with strict typing
- All 4 cron jobs implemented
- API integration with OpenWeatherMap
- Environment configuration
- Database indexes and optimization
- Error handling and logging
- Graceful shutdown

🚧 **In Progress:**
- API endpoint implementations
- Angular frontend

## 📄 License

MIT

## 👨‍💻 Author

Weather Monitoring System - Built with ❤️
