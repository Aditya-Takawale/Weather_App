import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

import { DashboardService } from '../../services/dashboard.service';
import { WeatherService } from '../../services/weather.service';
import { AlertService } from '../../services/alert.service';
import { DashboardSummary, WeatherData, Alert } from '../../models/weather.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatGridListModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private weatherService = inject(WeatherService);
  private alertService = inject(AlertService);

  dashboardData = signal<DashboardSummary | null>(null);
  currentWeather = signal<WeatherData | null>(null);
  activeAlerts = signal<Alert[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  private subscriptions: Subscription[] = [];
  readonly city = 'Pune';
  
  // Additional dashboard properties
  weekForecast = [
    { name: 'Mon', icon: 'wb_sunny', high: 19, low: 7 },
    { name: 'Tue', icon: 'wb_sunny', high: 22, low: 11 },
    { name: 'Wed', icon: 'wb_sunny', high: 23, low: 16 },
    { name: 'Thu', icon: 'cloud', high: 20, low: 14 },
    { name: 'Fri', icon: 'wb_sunny', high: 21, low: 16 }
  ];
  
  lightningStrikes = 0;
  uvIndex = 5;
  uvLabel = 'MODERATE';
  airQuality = 43;
  airQualityLabel = 'GOOD';
  moonIllumination = 87;
  moonriseIn = '36m';
  nextFullMoon = '4 Days';
  mapLayer = 'alerts';
  currentTime = new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  ngOnInit() {
    this.loadDashboardData();
    this.loadCurrentWeather();
    this.loadActiveAlerts();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadDashboardData() {
    this.loading.set(true);
    this.dashboardService.getDashboardSummary(this.city).subscribe({
      next: (response) => {
        this.dashboardData.set(response.data);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set('Failed to load dashboard data');
        this.loading.set(false);
        console.error('Dashboard error:', err);
      }
    });
  }

  loadCurrentWeather() {
    this.weatherService.getCurrentWeather(this.city).subscribe({
      next: (response) => {
        this.currentWeather.set(response.data);
      },
      error: (err) => {
        console.error('Weather error:', err);
      }
    });
  }

  loadActiveAlerts() {
    this.alertService.getActiveAlerts(this.city).subscribe({
      next: (response) => {
        this.activeAlerts.set(response.data);
      },
      error: (err) => {
        console.error('Alerts error:', err);
      }
    });
  }

  refreshData() {
    this.loadDashboardData();
    this.loadCurrentWeather();
    this.loadActiveAlerts();
  }

  private startAutoRefresh() {
    // Refresh dashboard every 10 minutes
    const dashboardSub = interval(600000)
      .pipe(startWith(0))
      .subscribe(() => this.loadDashboardData());

    // Refresh alerts every minute
    const alertsSub = interval(60000)
      .pipe(startWith(0))
      .subscribe(() => this.loadActiveAlerts());
    
    // Update current time every minute
    const timeSub = interval(60000).subscribe(() => {
      this.currentTime = new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    });

    this.subscriptions.push(dashboardSub, alertsSub, timeSub);
  }
  
  // Helper methods for calculations
  getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
  
  calculateDewPoint(tempC: number, humidity: number): number {
    // Magnus formula for dew point calculation
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100);
    const dewPointC = (b * alpha) / (a - alpha);
    return Math.round(dewPointC * 10) / 10; // Round to 1 decimal place
  }
}

