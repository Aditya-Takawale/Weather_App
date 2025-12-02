# Angular Study Guide - Weather Dashboard Project

## Table of Contents
1. [Why Angular Over React?](#why-angular-over-react)
2. [Project Architecture](#project-architecture)
3. [Core Components](#core-components)
4. [Services](#services)
5. [Models & Interfaces](#models--interfaces)
6. [Key Angular Features Used](#key-angular-features-used)
7. [Interview Questions & Answers](#interview-questions--answers)
8. [Advanced Concepts Implemented](#advanced-concepts-implemented)

---

## Why Angular Over React?

### Angular Advantages in This Project

| Feature | Angular | React | Why We Chose Angular |
|---------|---------|-------|----------------------|
| **Framework** | Full-featured framework | Library only | Complete MVC pattern with routing, forms, state management built-in |
| **Dependency Injection** | Native DI container | External libraries (Redux, etc.) | Cleaner service management and testing |
| **TypeScript** | Built-in, enforced | Optional | Type safety for complex weather data models |
| **Decorators** | @Component, @Injectable | Not standard | Cleaner syntax for component metadata |
| **Two-Way Binding** | Native `[(ngModel)]` | Manual or via libraries | Faster development with form handling |
| **RxJS Integration** | Native (Observables) | Via external libs | Seamless async data handling for API calls |
| **Material UI** | Angular Material (official) | Material-UI (community) | Consistent theming and pre-built components |
| **Server-Side Rendering** | Angular Universal | Next.js required | Built-in SSR support with no extra setup |
| **Signals** | Angular 20+ feature | Not available | New reactive system (reduces boilerplate) |
| **Module System** | Clear module structure | File-based | Better organization for large projects |
| **CLI Tooling** | Powerful `ng` CLI | Create-React-App (limited) | One-command generation for everything |

**Decision:** We chose Angular because this project requires:
- ✅ Strong TypeScript ecosystem for weather data models
- ✅ Built-in reactive programming with RxJS (perfect for real-time data)
- ✅ Native SSR for SEO-friendly weather dashboard
- ✅ Material Design components (professional look)
- ✅ Comprehensive dependency injection for service management

---

## Project Architecture

### Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── dashboard/
│   │   │       ├── dashboard.ts          (Main component)
│   │   │       ├── dashboard.html        (Template)
│   │   │       └── dashboard.scss        (Styles)
│   │   │
│   │   ├── services/
│   │   │   ├── weather.service.ts        (API calls)
│   │   │   ├── dashboard.service.ts      (Business logic)
│   │   │   └── alert.service.ts          (Alert management)
│   │   │
│   │   ├── models/
│   │   │   └── weather.model.ts          (Interfaces & types)
│   │   │
│   │   ├── app.ts                        (Root component)
│   │   ├── app.routes.ts                 (Routing config)
│   │   ├── app.config.ts                 (App configuration)
│   │   └── app.config.server.ts          (SSR configuration)
│   │
│   ├── environments/
│   │   ├── environment.ts                (Dev config)
│   │   └── environment.prod.ts           (Prod config)
│   │
│   └── main.ts                           (Entry point)
│
├── package.json
├── angular.json
└── tsconfig.json
```

### MVC Architecture Pattern

```
Model (TypeScript Interfaces)
    ↓
View (HTML Template)
    ↓
Controller (Component Class)
    ↓
Services (Dependency Injection)
    ↓
Backend API
```

---

## Core Components

### 1. Dashboard Component

**File:** `src/app/components/dashboard/dashboard.ts`

**Responsibility:** Main UI component that displays weather data with real-time updates

**Key Features:**

```typescript
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,                    // *ngIf, *ngFor
    MatCardModule,                   // Material cards
    MatButtonModule,                 // Material buttons
    MatIconModule,                   // Material icons
    MatProgressSpinnerModule,        // Loading spinner
    MatToolbarModule,                // Top toolbar
    MatGridListModule                // Grid layout
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
```

**Signals (Reactive State Management):**

```typescript
// New Angular 20 feature - replaces @Input/@Output
dashboardData = signal<DashboardSummary | null>(null);
currentWeather = signal<WeatherData | null>(null);
activeAlerts = signal<Alert[]>([]);
weekForecast = signal<any[]>([]);
airQualityData = signal<any>(null);
uvData = signal<any>(null);
moonData = signal<any>(null);
loading = signal(true);
```

**Lifecycle:**

```typescript
ngOnInit() {
  // Load data on component initialization
  this.loadCurrentWeather();
  this.loadDashboardData();
  this.loadActiveAlerts();
  this.loadForecast();
  this.loadAirQuality();
  this.loadUVIndex();
  this.loadMoonData();
  
  // Auto-refresh every 10 minutes for dashboard
  // Auto-refresh every 1 minute for alerts
  this.startAutoRefresh();
}

ngOnDestroy() {
  // Clean up subscriptions
  this.subscriptions.forEach(sub => sub.unsubscribe());
}
```

**Data Loading:**

```typescript
loadCurrentWeather() {
  this.weatherService.getCurrentWeather(this.city).subscribe({
    next: (response) => {
      this.currentWeather.set(response.data);  // Update signal
    },
    error: (err) => {
      console.error('Weather error:', err);
      this.error.set('Failed to load weather');
    }
  });
}
```

---

## Services

### 1. Weather Service

**File:** `src/app/services/weather.service.ts`

**Purpose:** Handle all weather API communication

```typescript
@Injectable({ providedIn: 'root' })
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Fetch current weather
  getCurrentWeather(city: string): Observable<ApiResponse<WeatherData>> { }

  // Fetch historical data (paginated)
  getWeatherHistory(
    city: string,
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date
  ): Observable<PaginatedResponse<WeatherData>> { }

  // Fetch 5-day forecast
  getForecast(): Observable<ApiResponse<any>> { }

  // Fetch air quality data
  getAirQuality(): Observable<ApiResponse<any>> { }

  // Fetch UV index
  getUVIndex(): Observable<ApiResponse<any>> { }

  // Fetch moon phase data
  getMoonData(): Observable<ApiResponse<any>> { }
}
```

### 2. Dashboard Service

**File:** `src/app/services/dashboard.service.ts`

**Purpose:** Business logic for dashboard summary calculations

```typescript
@Injectable({ providedIn: 'root' })
export class DashboardService {
  getDashboardSummary(city: string): Observable<ApiResponse<DashboardSummary>> {
    // Fetches aggregated weather statistics
  }
}
```

### 3. Alert Service

**File:** `src/app/services/alert.service.ts`

**Purpose:** Manage weather alerts

```typescript
@Injectable({ providedIn: 'root' })
export class AlertService {
  getActiveAlerts(city: string): Observable<ApiResponse<Alert[]>> {
    // Fetch currently active alerts
  }

  createAlert(alertData: any): Observable<ApiResponse<any>> {
    // Create new alert
  }

  updateAlert(id: string, alertData: any): Observable<ApiResponse<any>> {
    // Update existing alert
  }

  deleteAlert(id: string): Observable<ApiResponse<any>> {
    // Delete alert
  }
}
```

---

## Models & Interfaces

**File:** `src/app/models/weather.model.ts`

### WeatherData Interface

```typescript
export interface WeatherData {
  _id: string;
  city: string;
  timestamp: Date;
  coordinates: { lon: number; lat: number };
  weatherId: number;
  weatherMain: string;              // "Clear", "Clouds", "Rain"
  weatherDescription: string;       // "few clouds"
  weatherIcon: string;              // Icon code
  temperature: number;              // °C
  feelsLike: number;                // °C
  tempMin: number;                  // °C
  tempMax: number;                  // °C
  pressure: number;                 // hPa
  humidity: number;                 // %
  windSpeed: number;                // km/h
  windDirection: number;            // degrees (0-360)
  windGust?: number;                // km/h
  cloudiness: number;               // %
  visibility: number;               // meters
  country: string;
  sunrise: number;                  // Unix timestamp
  sunset: number;                   // Unix timestamp
  dt: number;                       // Unix timestamp
  timezone: number;                 // Timezone offset
}
```

### DashboardSummary Interface

```typescript
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
```

### Alert Interface

```typescript
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
```

### API Response Wrappers

```typescript
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
```

---

## Key Angular Features Used

### 1. **Standalone Components** (Angular 14+)

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,                    // No NgModule required
  imports: [CommonModule, MatCardModule], // Direct imports
  template: '...'
})
export class DashboardComponent { }
```

**Benefit:** Simpler component declaration, tree-shaking friendly

### 2. **Signals** (Angular 16+)

```typescript
// NEW: Replaces traditional @Input/@Output
dashboardData = signal<DashboardSummary | null>(null);

// Update signal
dashboardData.set(newData);

// Read signal
<div>{{ dashboardData()?.temperature }}</div>

// Computed signals
temperatureChartData = computed(() => {
  const data = this.dashboardData();
  return data ? transformData(data) : [];
});
```

**Benefits:**
- More granular reactivity (only affected signals re-render)
- Simpler than Observable/BehaviorSubject
- No memory leaks from subscriptions

### 3. **Dependency Injection**

```typescript
@Injectable({ providedIn: 'root' })
export class WeatherService {
  // Service automatically provided to entire app
}

export class DashboardComponent {
  private weatherService = inject(WeatherService);  // Inject service
}
```

**Benefits:**
- Testable (easy to mock in unit tests)
- Singleton pattern (one instance shared across app)
- Type-safe

### 4. **RxJS Observables**

```typescript
// Observable pattern for async data
getCurrentWeather(): Observable<WeatherData> {
  return this.http.get<WeatherData>(url);
}

// Subscribe in component
this.weatherService.getCurrentWeather().subscribe({
  next: (data) => this.currentWeather.set(data),
  error: (err) => this.error.set('Error'),
  complete: () => console.log('Done')
});
```

**Operators Used:**
- `switchMap()` - Cancel previous request, start new one
- `startWith()` - Initial value
- `map()` - Transform data
- `catchError()` - Handle errors

### 5. **Material Design**

```typescript
imports: [
  MatCardModule,            // <mat-card> containers
  MatButtonModule,          // <button mat-button>
  MatIconModule,            // <mat-icon>
  MatToolbarModule,         // <mat-toolbar>
  MatProgressSpinnerModule, // <mat-spinner>
  MatGridListModule         // <mat-grid-list>
]
```

**Why Material?**
- Consistent, professional UI
- Accessibility built-in (WCAG compliant)
- Responsive by default
- Dark/Light theme support

### 6. **Template Syntax**

```html
<!-- Interpolation -->
<div>{{ currentWeather()?.temperature }}°C</div>

<!-- Property binding -->
<mat-card [class.loading]="loading()">

<!-- Event binding -->
<button (click)="refreshData()">Refresh</button>

<!-- Two-way binding (uncommon with Signals) -->
<input [(ngModel)]="searchQuery" />

<!-- Structural directives -->
<div *ngIf="currentWeather(); else loading">
  Show weather
</div>
<ng-template #loading>
  <mat-spinner></mat-spinner>
</ng-template>

<!-- ngFor with tracking -->
<div *ngFor="let item of weekForecast(); trackBy: trackByDay">
  {{ item.name }}
</div>
```

### 7. **Environment Configuration**

```typescript
// environment.ts (development)
export const environment = {
  apiUrl: 'http://localhost:3000/api',
  production: false
};

// environment.prod.ts (production)
export const environment = {
  apiUrl: 'https://api.weather-app.com/api',
  production: true
};
```

### 8. **Server-Side Rendering (Angular Universal)**

```typescript
// app.config.server.ts
import { renderApplication } from '@angular/platform-server';

// Enables SSR for faster first paint & SEO
// Caches rendered HTML on server
// Pre-fetches data before sending to client
```

---

## Interview Questions & Answers

### Basic Level

**Q1: What is Angular? How is it different from AngularJS?**

A: Angular is a complete TypeScript-based framework (formerly Angular 2+), while AngularJS was JavaScript-based. Key differences:

| Aspect | AngularJS | Angular |
|--------|-----------|---------|
| Language | JavaScript | TypeScript |
| Architecture | MVC | MVC with components |
| Rendering | Two-way binding | One-way + two-way |
| Performance | Slower | ~5x faster (tree-shaking) |
| Mobile | No | Ionic, NativeScript |
| Testing | Harder | Jasmine + Karma built-in |

In our project, we use Angular 20.3.14 for modern TypeScript support and better performance for real-time weather updates.

---

**Q2: What are Signals in Angular? Why use them?**

A: Signals are a new reactive primitive (Angular 16+) that replace much boilerplate code:

```typescript
// Old way (Observable)
dashboardData$: BehaviorSubject<DashboardSummary> = new BehaviorSubject(null);
constructor() {
  this.dashboardData$.subscribe(data => {
    // Manual subscription management
  });
}

// New way (Signals)
dashboardData = signal<DashboardSummary | null>(null);
// Use: dashboardData() to read
// Use: dashboardData.set(data) to update
// Angular tracks dependencies automatically!
```

**Benefits:**
- ✅ Automatic dependency tracking
- ✅ No explicit subscriptions needed
- ✅ Better performance (granular updates)
- ✅ Simpler syntax
- ✅ Less memory leaks

In our Weather Dashboard, signals power the real-time weather updates without subscription management.

---

**Q3: Explain Dependency Injection in Angular**

A: DI is a design pattern where classes receive dependencies from external sources rather than creating them.

```typescript
// Without DI (tightly coupled)
class DashboardComponent {
  weatherService = new WeatherService(); // Creates its own
}

// With DI (loosely coupled)
@Injectable({ providedIn: 'root' })
class WeatherService { }

class DashboardComponent {
  constructor(private weatherService: WeatherService) {}
  // Angular provides the instance
}
```

**Benefits:**
- ✅ Testability (mock services easily)
- ✅ Reusability (one instance shared)
- ✅ Loose coupling
- ✅ Centralized configuration

In our project, all services (WeatherService, DashboardService, AlertService) use DI for clean testable code.

---

**Q4: What are Observables in RxJS? How are they used?**

A: Observables represent a sequence of values over time (async data).

```typescript
// Creating an Observable
const weather$: Observable<WeatherData> = this.http.get(url);

// Subscribing to it
weather$.subscribe({
  next: (data) => console.log('Got data:', data),
  error: (err) => console.error('Error:', err),
  complete: () => console.log('Stream ended')
});
```

**Operators:**

```typescript
// switchMap: Cancel previous request, start new one
this.searchQuery$
  .pipe(
    switchMap(query => this.weatherService.search(query))
  )
  .subscribe(results => { });

// map: Transform data
this.weatherService.getCurrentWeather()
  .pipe(
    map(response => response.data.temperature)
  )
  .subscribe(temp => { });

// startWith: Initial value
interval(10000)
  .pipe(startWith(0))
  .subscribe(() => this.refreshData()); // Runs immediately + every 10s
```

In our project, Observables handle API calls and auto-refresh intervals seamlessly.

---

### Intermediate Level

**Q5: Explain standalone components and why they're better**

A: Standalone components don't require NgModule declaration:

```typescript
// Old way (requires NgModule)
@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonModule, MatCardModule],
  providers: [WeatherService]
})
export class DashboardModule { }

// New way (standalone, Angular 14+)
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  providers: [WeatherService]
})
export class DashboardComponent { }
```

**Benefits:**
- ✅ Tree-shaking friendly (smaller bundles)
- ✅ Simpler mental model
- ✅ Easier testing
- ✅ Lazy loading more straightforward

Our Weather Dashboard uses standalone components for optimal bundle size.

---

**Q6: How does Angular's change detection work?**

A: Angular checks for changes and updates the view when data changes.

```typescript
// Default strategy: CheckAlways
// Angular checks ALL components after ANY event

// OnPush strategy: More efficient
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush
  // Only check when:
  // 1. @Input property changes
  // 2. Component emits event
  // 3. Explicitly marked with markForCheck()
})
```

**With Signals, change detection is even smarter:**

```typescript
dashboardData = signal<DashboardSummary | null>(null);
// Angular only re-renders components using this signal
// Other components stay unchanged (much faster!)
```

---

**Q7: What is the difference between @Input, @Output, and Services for communication?**

A: Three ways components communicate:

```typescript
// 1. @Input: Parent → Child
@Component({
  selector: 'app-weather-card',
  inputs: ['weatherData']  // New standalone syntax
})
class WeatherCardComponent {
  weatherData = input<WeatherData>();
}

// 2. @Output: Child → Parent
@Component({
  selector: 'app-weather-card'
})
class WeatherCardComponent {
  refreshClicked = output<void>();
  
  refresh() {
    this.refreshClicked.emit();
  }
}

// 3. Services: Any → Any (most common)
@Injectable({ providedIn: 'root' })
class WeatherService {
  weatherUpdated$ = new BehaviorSubject<WeatherData>(null);
}

// In component
this.weatherService.weatherUpdated$.subscribe(data => {
  this.updateUI(data);
});
```

**When to use:**
- @Input/@Output: Props-like, shallow hierarchy
- Services: Complex state, cross-component communication

Our project uses Services for global weather state management.

---

**Q8: Explain lazy loading in Angular**

A: Load feature modules only when needed:

```typescript
// app.routes.ts
const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard')
      .then(m => m.DashboardComponent)
    // Module only loaded when user navigates to /dashboard
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module')
      .then(m => m.AdminModule)
    // Entire module lazy-loaded
  }
];
```

**Benefits:**
- ✅ Smaller initial bundle
- ✅ Faster first page load
- ✅ Better performance

---

### Advanced Level

**Q9: How would you optimize the Weather Dashboard for performance?**

A: Several strategies:

```typescript
// 1. OnPush Change Detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// 2. Unsubscribe pattern (or use Signals)
private destroy$ = new Subject<void>();

ngOnInit() {
  this.weatherService.getCurrentWeather()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// 3. Lazy load images
<img [src]="weatherIcon" loading="lazy" />

// 4. Virtual scrolling for large lists
<cdk-virtual-scroll-viewport [itemSize]="50">
  <div *cdkVirtualFor="let item of weatherHistory">
    {{ item }}
  </div>
</cdk-virtual-scroll-viewport>

// 5. Memoization with Signals
weatherStats = computed(() => {
  // Only recalculates when dashboardData changes
  return calculateStats(this.dashboardData());
});

// 6. Request caching
private cache$ = new Map<string, Observable<any>>();

getWeather(city: string) {
  if (!this.cache$.has(city)) {
    this.cache$.set(
      city,
      this.http.get(`/api/weather/${city}`).pipe(shareReplay(1))
    );
  }
  return this.cache$.get(city)!;
}
```

---

**Q10: How does Server-Side Rendering (SSR) work in Angular Universal?**

A: Angular Universal renders components on the server and sends HTML:

```typescript
// Without SSR (Client-Side Rendering)
Server sends: <html><div id="app"></div></html>
Browser downloads JS → Renders components → Shows UI
Result: Blank page initially (bad for SEO)

// With SSR (Server-Side Rendering)
Server renders ALL HTML → Sends: <html><div>...full content...</div></html>
Browser shows full page immediately → Downloads JS for interactivity
Result: Fast first paint + SEO friendly + better UX

// In our project (app.config.server.ts)
import { renderApplication } from '@angular/platform-server';

export default async function render(url: string, document: string) {
  const html = await renderApplication(bootstrap, {
    url,
    document,
    platformProviders: [
      // Pre-fetch weather data on server
      // Send pre-rendered HTML to client
    ]
  });
  return html;
}
```

**Benefits:**
- ✅ SEO friendly (Google crawls HTML, not JS)
- ✅ Faster first paint
- ✅ Works without JavaScript
- ✅ Better social media sharing

Our Weather Dashboard uses Angular Universal for SEO + performance.

---

**Q11: Explain RxJS operators used in this project**

A: Key operators managing real-time weather data:

```typescript
// switchMap: Cancel previous, start new
// Used for: Search, auto-complete, cancelling old requests
this.searchQuery$
  .pipe(
    switchMap(query => this.weatherService.searchCities(query))
  )
  .subscribe(results => { });

// startWith: Initial value
// Used for: Immediate data load + auto-refresh
interval(600000) // 10 minutes
  .pipe(startWith(0)) // Load immediately
  .subscribe(() => this.loadDashboardData());

// debounceTime: Wait before executing
// Used for: Reduce API calls on frequent events
this.temperatureInput$
  .pipe(
    debounceTime(300), // Wait 300ms after user stops typing
    distinctUntilChanged(), // Only if value changed
    switchMap(temp => this.filterByTemp(temp))
  )
  .subscribe(results => { });

// shareReplay: Cache and share result
// Used for: Multiple subscribers get same data
this.weatherData$ = this.http.get('/api/weather')
  .pipe(shareReplay(1)); // All subscribers share 1 HTTP request

// timeout: Throw error if no response
this.weatherService.getCurrentWeather()
  .pipe(timeout(5000)) // Timeout after 5 seconds
  .subscribe({
    next: (data) => { },
    error: () => console.error('Request timed out')
  });
```

---

**Q12: How do you handle errors in Angular?**

A: Multiple error handling strategies:

```typescript
// 1. In component subscribe
this.weatherService.getCurrentWeather().subscribe({
  next: (data) => this.currentWeather.set(data),
  error: (err) => {
    console.error('API Error:', err);
    this.error.set('Failed to load weather data');
  },
  complete: () => console.log('Complete')
});

// 2. Using catchError operator
this.weatherService.getCurrentWeather()
  .pipe(
    catchError(error => {
      console.error('Error:', error);
      return of(defaultWeatherData); // Fallback
    })
  )
  .subscribe(data => { });

// 3. Global error handler
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private logger: LoggingService) {}
  
  handleError(error: Error): void {
    this.logger.logError(error);
    // Send to monitoring service (Sentry, etc.)
  }
}

// Register in app config
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};

// 4. In our project
loadCurrentWeather() {
  this.weatherService.getCurrentWeather(this.city).subscribe({
    next: (response) => {
      this.currentWeather.set(response.data);
      this.error.set(null);
    },
    error: (err) => {
      this.error.set('Failed to load weather');
      this.loading.set(false);
    }
  });
}
```

---

## Advanced Concepts Implemented

### 1. **Reactive Data Flow**

```
Backend API → Observable (HTTP) → Operator Pipeline → Signal → Component → Template
```

**Example in our project:**

```typescript
// Services emit weather data
weatherService.getCurrentWeather() → Observable<WeatherData>

// Component subscribes and updates signals
.subscribe(data => this.currentWeather.set(data))

// Template reacts to signal changes
{{ currentWeather()?.temperature }}°C

// Angular automatically re-renders only affected DOM
```

### 2. **Auto-Refresh Pattern**

```typescript
startAutoRefresh() {
  // Refresh dashboard every 10 minutes
  const dashboardSub = interval(600000) // 10 * 60 * 1000
    .pipe(startWith(0))
    .subscribe(() => this.loadDashboardData());

  // Refresh alerts every minute
  const alertsSub = interval(60000)
    .pipe(startWith(0))
    .subscribe(() => this.loadActiveAlerts());

  // Store for cleanup
  this.subscriptions.push(dashboardSub, alertsSub);
}

ngOnDestroy() {
  // Clean up all subscriptions to prevent memory leaks
  this.subscriptions.forEach(sub => sub.unsubscribe());
}
```

### 3. **Computed Signals (Memoization)**

```typescript
// Only recalculates when dashboardData changes
temperatureChartData = computed(() => {
  const summary = this.dashboardData();
  if (!summary) return [];
  
  return {
    labels: summary.hourlyTrends.map(t => new Date(t.hour)),
    datasets: [{
      data: summary.hourlyTrends.map(t => t.avgTemperature),
      fill: false,
      tension: 0.4,
      borderColor: '#7C3AED'
    }]
  };
});
```

### 4. **Type-Safe HTTP**

```typescript
// Full type safety with generics
getCurrentWeather(city: string): Observable<ApiResponse<WeatherData>> {
  return this.http.get<ApiResponse<WeatherData>>(url);
  // TypeScript knows: response.data is WeatherData
  // Compile-time type checking prevents runtime errors
}

// In component
this.weatherService.getCurrentWeather(city).subscribe(response => {
  // response.data is typed as WeatherData
  const temp = response.data.temperature; // ✅ Type-safe
  console.log(temp.toFixed(1));           // ✅ Temperature is number
});
```

### 5. **Material Theme Customization**

```scss
// Custom Angular Material theme with rose/red colors
@use '@angular/material' as mat;

$custom-primary: mat.define-palette($rose-palette);
$custom-accent: mat.define-palette($red-palette);
$custom-warn: mat.define-palette($orange-palette);

$custom-theme: mat.define-light-theme((
  color: (
    primary: $custom-primary,
    accent: $custom-accent,
    warn: $custom-warn,
  )
));

@include mat.all-component-colors($custom-theme);
```

---

## Summary: Why Angular Excels Here

✅ **Type Safety:** TypeScript catches bugs before runtime  
✅ **Reactivity:** Signals + RxJS for real-time data  
✅ **Performance:** OnPush detection, tree-shaking, code splitting  
✅ **SEO:** Server-side rendering with Angular Universal  
✅ **Scalability:** Clear architecture (Components → Services → Models)  
✅ **Developer Experience:** CLI, testing, debugging tools  
✅ **Material Design:** Professional UI components out-of-the-box  
✅ **Enterprise:** Used by Google, Microsoft, IBM (battle-tested)  

---

## Resources

- [Angular Official Docs](https://angular.io/docs)
- [Angular 20 Signals](https://angular.io/guide/signals)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular Material](https://material.angular.io/)
- [Angular Universal (SSR)](https://angular.io/guide/ssr)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated:** November 28, 2025  
**Angular Version:** 20.3.14  
**Project:** Weather Dashboard  
