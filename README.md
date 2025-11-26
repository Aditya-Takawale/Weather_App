# 🌤️ Weather Dashboard - Real-time Monitoring System

A full-stack weather monitoring application with real-time data fetching, dashboard analytics, automated alerts, and data cleanup. Built with **Node.js**, **Express**, **MongoDB**, and **Angular 20**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Angular](https://img.shields.io/badge/angular-20.3.14-red.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Cron Jobs](#-cron-jobs)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Dashboard Features](#-dashboard-features)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Functionality
- 🌍 **Real-time Weather Data** - Fetches from OpenWeatherMap API every 30 minutes
- 📊 **Interactive Dashboard** - Modern Angular UI with real-time updates
- 🔔 **Smart Alerts** - Configurable thresholds for temperature, humidity, and extreme weather
- 📈 **Trend Analytics** - Hourly and daily weather trends with charts
- 🧹 **Auto Cleanup** - Automated data retention management
- 🌐 **Multi-City Support** - Currently configured for Pune, India (easily extensible)

### Technical Features
- ⚡ Server-Side Rendering (SSR) with Angular
- 🔄 Auto-refresh dashboard every 10 minutes
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🎨 Material Design UI components
- 🔐 Environment-based configuration
- 📝 Comprehensive logging with Winston
- 🚀 Production-ready deployment setup

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥18.0.0 | Runtime environment |
| Express.js | ^4.18.2 | Web framework |
| TypeScript | ^5.9.3 | Type-safe JavaScript |
| MongoDB | Latest | Database |
| Mongoose | ^8.0.3 | ODM for MongoDB |
| node-cron | ^3.0.3 | Job scheduling |
| Winston | ^3.11.0 | Logging |
| Axios | ^1.6.2 | HTTP client |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 20.3.14 | Frontend framework |
| Angular Material | 20.2.14 | UI components |
| TypeScript | 5.9.2 | Type safety |
| Chart.js | ^4.5.1 | Data visualization |
| RxJS | ~7.8.0 | Reactive programming |
| SCSS | - | Styling |

---

## 📁 Project Structure

```
Weather_Dashboard/
├── backend/                    # Node.js/Express Backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── jobs/              # Cron jobs (4 automated tasks)
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── server.ts          # Express app entry
│   ├── scripts/               # Utility scripts
│   └── package.json
│
├── frontend/                   # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # UI Components
│   │   │   ├── services/      # HTTP services
│   │   │   └── models/        # TypeScript interfaces
│   │   └── main.ts            # App bootstrap
│   └── package.json
│
├── package.json               # Root package with npm run dev
├── README.md                  # This file
├── SCHEMA_DESIGN.md          # Database schema docs
└── PROJECT_STRUCTURE.md      # Detailed structure guide
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed documentation.

---

## 📦 Prerequisites

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **OpenWeatherMap API Key** - [Get Free API Key](https://openweathermap.org/api)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Aditya-Takawale/Weather_App.git
cd Weather_App
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

---

## ⚙️ Configuration

### Backend Configuration

Create `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/weather_dashboard

# OpenWeatherMap API
OPENWEATHER_API_KEY=your_api_key_here
WEATHER_CITY=Pune
WEATHER_COUNTRY_CODE=IN

# Cron Job Schedules
CRON_DATA_FETCH=*/30 * * * *         # Every 30 minutes
CRON_DASHBOARD_UPDATE=0 * * * *      # Every hour
CRON_DATA_CLEANUP=0 0 * * *          # Daily at midnight
CRON_ALERT_CHECK=*/15 * * * *        # Every 15 minutes

# Alert Thresholds
ALERT_HIGH_TEMP_THRESHOLD=35         # °C
ALERT_HIGH_HUMIDITY_THRESHOLD=80     # %

# Data Retention
DATA_RETENTION_DAYS=2
```

---

## 🎯 Running the Application

### Quick Start (Recommended)

From the **root directory**, run both backend and frontend together:

```bash
npm run dev
```

This command:
- ✅ Builds and starts backend on `http://localhost:3000`
- ✅ Starts frontend on `http://localhost:4200`
- ✅ Auto-reloads on file changes
- ✅ Runs both servers concurrently

### Run Separately

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

### Production

```bash
npm run build  # Build both
npm start      # Start production servers
```

---

## ⏰ Cron Jobs

The application runs **4 automated cron jobs**:

### 1. 🌤️ Weather Data Fetching
- **Schedule:** Every 30 minutes
- **Purpose:** Fetches real-time weather from OpenWeatherMap API
- **City:** Pune, India
- **Data:** Temperature (°C), Humidity (%), Wind (km/h), Pressure (hPa)
- **File:** `backend/src/jobs/dataFetchJob.ts`

### 2. 📊 Dashboard Data Population
- **Schedule:** Every 1 hour
- **Purpose:** Computes aggregated statistics and trends
- **Output:** Min/max/avg temps, hourly trends, weather patterns
- **Endpoint:** `GET /api/dashboard/summary`
- **File:** `backend/src/jobs/dashboardUpdateJob.ts`

### 3. 🧹 Data Cleanup
- **Schedule:** Daily at midnight
- **Purpose:** Maintains database performance
- **Action:** Soft-deletes records older than 2 days
- **File:** `backend/src/jobs/dataCleanupJob.ts`

### 4. 🚨 Weather Alert Notifications
- **Schedule:** Every 15 minutes
- **Purpose:** Monitors conditions against thresholds
- **Checks:** High temp (>35°C), High humidity (>80%), Extreme weather
- **Output:** Alert logs and notifications
- **File:** `backend/src/jobs/alertCheckJob.ts`

---

## 🔌 API Documentation

### Weather Endpoints

#### Get Current Weather
```http
GET /api/weather/current
```

**Response:**
```json
{
  "success": true,
  "data": {
    "city": "Pune",
    "temperature": 26.9,
    "humidity": 37,
    "pressure": 1013,
    "windSpeed": 9.8,
    "weatherMain": "Clouds"
  }
}
```

### Dashboard Endpoints

#### Get Dashboard Summary
```http
GET /api/dashboard/summary
```

### Alert Endpoints

#### Get Active Alerts
```http
GET /api/alerts/active
```

#### Create Alert Rule
```http
POST /api/alerts/config
```

---

## 🗄️ Database Schema

### Collections

1. **rawweatherdatas** - Real-time weather data
2. **dashboardsummaries** - Aggregated hourly summaries
3. **alertconfigs** - User-defined alert rules
4. **alertlogs** - Triggered alert history

See [SCHEMA_DESIGN.md](SCHEMA_DESIGN.md) for detailed schema documentation.

---

## 🎨 Dashboard Features

### Main Components

- **🌡️ Main Temperature Card** - Current temp, feels like, weather icon
- **📅 5-Day Forecast** - Daily highs/lows with icons
- **💨 Wind Information** - Speed, direction, compass
- **💧 Humidity & Dew Point** - Real-time moisture levels
- **🌧️ Precipitation** - Rainfall/snowfall data
- **🔲 Atmospheric Pressure** - Current hPa reading
- **🌙 Moon Phase** - Phase, illumination, rise/set times
- **🗺️ Map View** - Location visualization
- **⚠️ Active Alerts** - Weather warnings
- **☀️ UV Index** - Radiation levels with risk category
- **🌫️ Air Quality** - AQI with health recommendations

### Design Features
- ✨ Modern card-based layout
- 🎨 Material Design components
- 📱 Fully responsive
- 🌈 Colorful accent borders
- ⚡ Auto-refresh every 10 minutes

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👤 Author

**Aditya Takawale**

- GitHub: [@Aditya-Takawale](https://github.com/Aditya-Takawale)
- Repository: [Weather_App](https://github.com/Aditya-Takawale/Weather_App)

---

## 🙏 Acknowledgments

- [OpenWeatherMap API](https://openweathermap.org/) for weather data
- [Angular Team](https://angular.io/) for the framework
- [MongoDB](https://www.mongodb.com/) for the database

---

**⭐ If you find this project useful, please give it a star!**
