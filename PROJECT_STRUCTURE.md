# Weather Dashboard - Project Structure

## 📁 Root Directory Structure

```
Weather_Dashboard/
├── backend/                 # Node.js/Express API Server
├── frontend/                # Angular 20 Client Application
├── .gitignore              # Git ignore rules
├── README.md               # Project overview
├── SCHEMA_DESIGN.md        # Database schema documentation
└── PROJECT_STRUCTURE.md    # This file
```

---

## 🔧 Backend Structure (`/backend`)

```
backend/
├── src/                    # TypeScript source code
│   ├── config/            # Configuration files
│   │   ├── database.ts    # MongoDB connection config
│   │   ├── env.ts         # Environment variables
│   │   └── logger.ts      # Winston logger setup
│   │
│   ├── jobs/              # Scheduled cron jobs
│   │   ├── cronScheduler.ts        # Main cron scheduler
│   │   ├── dataFetchJob.ts         # Fetch weather data (30min)
│   │   ├── dashboardUpdateJob.ts   # Update dashboard (1hr)
│   │   ├── dataCleanupJob.ts       # Cleanup old data (daily)
│   │   └── alertCheckJob.ts        # Check alerts (15min)
│   │
│   ├── models/            # MongoDB Mongoose schemas
│   │   ├── AlertConfig.ts          # Alert configuration schema
│   │   ├── AlertLog.ts             # Alert log schema
│   │   ├── DashboardSummary.ts     # Dashboard summary schema
│   │   ├── RawWeatherData.ts       # Raw weather data schema
│   │   └── index.ts                # Model exports
│   │
│   ├── routes/            # Express route handlers
│   │   ├── alertRoutes.ts          # /api/alerts/* endpoints
│   │   ├── dashboardRoutes.ts      # /api/dashboard/* endpoints
│   │   └── weatherRoutes.ts        # /api/weather/* endpoints
│   │
│   ├── services/          # Business logic layer
│   │   ├── dashboardService.ts     # Dashboard data aggregation
│   │   └── weatherService.ts       # OpenWeatherMap API integration
│   │
│   └── server.ts          # Express app entry point
│
├── scripts/               # Utility scripts (not part of build)
│   ├── checkData.js       # MongoDB data inspection
│   ├── clearOldData.js    # Database cleanup utility
│   ├── triggerFetch.js    # Manual data fetch trigger
│   └── fetchNow.mjs       # Immediate data fetch
│
├── dist/                  # Compiled JavaScript (gitignored)
├── logs/                  # Application logs (gitignored)
├── node_modules/          # Dependencies (gitignored)
├── .env                   # Environment variables (gitignored)
├── .env.example           # Environment template
├── .eslintrc.json         # ESLint configuration
├── package.json           # NPM dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # Backend documentation
```

### Backend API Endpoints

#### Weather Endpoints (`/api/weather`)
- `GET /current` - Get current weather data
- `GET /historical` - Get historical weather data
- `GET /forecast` - Get weather forecast (planned)

#### Dashboard Endpoints (`/api/dashboard`)
- `GET /summary` - Get dashboard summary
- `GET /summary/date/:date` - Get summary for specific date

#### Alert Endpoints (`/api/alerts`)
- `GET /config` - Get alert configurations
- `POST /config` - Create new alert config
- `PUT /config/:id` - Update alert config
- `DELETE /config/:id` - Delete alert config
- `GET /logs` - Get alert logs
- `GET /active` - Get active alerts

---

## 🎨 Frontend Structure (`/frontend`)

```
frontend/
├── src/
│   ├── app/                       # Angular application
│   │   ├── components/           # UI Components
│   │   │   └── dashboard/        # Main dashboard component
│   │   │       ├── dashboard.html      # Dashboard template
│   │   │       ├── dashboard.scss      # Dashboard styles
│   │   │       └── dashboard.ts        # Dashboard logic
│   │   │
│   │   ├── models/               # TypeScript interfaces
│   │   │   └── weather.model.ts  # Weather data types
│   │   │
│   │   ├── services/             # HTTP services
│   │   │   ├── alert.service.ts         # Alert API calls
│   │   │   ├── dashboard.service.ts     # Dashboard API calls
│   │   │   └── weather.service.ts       # Weather API calls
│   │   │
│   │   ├── app.config.ts         # App configuration
│   │   ├── app.config.server.ts  # SSR configuration
│   │   ├── app.routes.ts         # Client routes
│   │   ├── app.routes.server.ts  # Server routes
│   │   ├── app.ts                # Root component
│   │   ├── app.html              # Root template
│   │   └── app.scss              # Global styles
│   │
│   ├── environments/             # Environment configs (if any)
│   ├── index.html                # Main HTML file
│   ├── main.ts                   # Client entry point
│   ├── main.server.ts            # Server entry point
│   ├── server.ts                 # SSR server
│   └── styles.scss               # Global styles
│
├── public/                       # Static assets
├── dist/                         # Build output (gitignored)
├── node_modules/                 # Dependencies (gitignored)
├── .angular/                     # Angular cache (gitignored)
├── angular.json                  # Angular CLI config
├── package.json                  # NPM dependencies
├── tsconfig.json                 # TypeScript config
├── tsconfig.app.json             # App TypeScript config
└── README.md                     # Frontend documentation
```

---

## 🗄️ Database Structure (MongoDB)

### Collections

1. **rawweatherdatas** - Current weather data from API
   - Stores real-time weather information
   - Updated every 30 minutes
   - Retention: 30 days

2. **dashboardsummaries** - Aggregated dashboard data
   - Hourly weather summaries
   - Statistical aggregations
   - Retention: 90 days

3. **alertconfigs** - User-defined alert rules
   - Temperature thresholds
   - Weather condition alerts
   - Persistent storage

4. **alertlogs** - Triggered alert history
   - Alert timestamps
   - Condition details
   - Retention: 7 days

---

## 🔄 Data Flow

```
OpenWeatherMap API
        ↓
weatherService.ts (Backend)
        ↓
MongoDB (rawweatherdatas)
        ↓
API Endpoints (/api/weather/*)
        ↓
weather.service.ts (Frontend)
        ↓
Dashboard Component
        ↓
User Interface
```

---

## 🛠️ Key Technologies

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Scheduler**: node-cron
- **Logging**: Winston
- **HTTP Client**: Axios
- **Validation**: express-validator

### Frontend
- **Framework**: Angular 20.3.14
- **Language**: TypeScript
- **UI Library**: Angular Material 20.2.14
- **Charts**: Chart.js
- **Rendering**: Server-Side Rendering (SSR)
- **State Management**: Angular Signals
- **Styles**: SCSS with Material theming

---

## 📝 Configuration Files

### Backend `.env` (Required)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/weather_dashboard
OPENWEATHER_API_KEY=your_api_key_here
CITY=Pune
COUNTRY_CODE=IN
NODE_ENV=development
```

### Frontend Environment
- Configured via Angular CLI
- API base URL: `http://localhost:3000/api`
- SSR enabled by default

---

## 🚀 Running the Application

### Backend
```bash
cd backend
npm install
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm install
ng serve
# or for SSR
npm run dev:ssr
```

---

## 📊 Code Organization Principles

1. **Separation of Concerns**: Each module has a single responsibility
2. **Modular Structure**: Features are self-contained
3. **Type Safety**: Full TypeScript throughout
4. **RESTful API**: Standard REST conventions
5. **Clean Architecture**: Layered approach (Routes → Services → Models)
6. **DRY Principle**: Reusable services and utilities
7. **Configuration Management**: Environment-based configs
8. **Error Handling**: Centralized error management
9. **Logging**: Structured logging with Winston
10. **Documentation**: Inline comments and separate docs

---

## 🔐 Security Considerations

- Environment variables for sensitive data
- API key stored in `.env` (gitignored)
- MongoDB connection string protected
- CORS configured appropriately
- Input validation on all endpoints
- Rate limiting (planned)

---

## 📈 Scalability Features

- Modular microservice-ready architecture
- Stateless API design
- Database indexing on frequently queried fields
- Cron job scheduling for background tasks
- Async/await for non-blocking operations
- Connection pooling for MongoDB

---

## 🧪 Testing Structure (Planned)

```
backend/
├── src/
│   └── __tests__/
│       ├── services/
│       ├── routes/
│       └── models/

frontend/
├── src/
│   └── app/
│       ├── components/
│       │   └── dashboard/
│       │       └── dashboard.spec.ts
│       └── services/
│           └── *.spec.ts
```

---

## 📚 Additional Documentation

- **README.md** - Project overview and setup
- **SCHEMA_DESIGN.md** - Database schema details
- **PROJECT_STRUCTURE.md** - This file
- **API Documentation** - (Planned: Swagger/OpenAPI)

---

## 👥 Contributing Guidelines

1. Follow the existing folder structure
2. Place files in appropriate directories
3. Use TypeScript for type safety
4. Follow Angular style guide for frontend
5. Use meaningful file and variable names
6. Add comments for complex logic
7. Update documentation when adding features
8. Remove unused code and files

---

**Last Updated**: November 26, 2025
**Version**: 1.0.0
