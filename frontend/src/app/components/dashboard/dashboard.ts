import { Component, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { NgxUiLoaderService, NgxUiLoaderModule } from 'ngx-ui-loader';
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
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatGridListModule,
    NgxUiLoaderModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData = signal<DashboardSummary | null>(null);
  currentWeather = signal<WeatherData | null>(null);
  activeAlerts = signal<Alert[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  private subscriptions: Subscription[] = [];
  readonly city = 'Pune';
  
  // Additional dashboard properties - now as signals
  weekForecast = signal<any[]>([]);
  airQualityData = signal<any>(null);
  uvData = signal<any>(null);
  moonData = signal<any>(null);
  
  // Report details properties
  verifyPanReportDetails: any[] = [];
  noOfRecord: number = 0;
  searchText: string = '';
  startDate: string = '';
  endDate: string = '';
  pageSize: number = 10;
  pageIndex: number = 0;
  
  // Form group for filters
  filterForm: FormGroup;
  
  mapLayer = 'alerts';
  currentTime = new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  constructor(
    private changeDetection: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private dashboardService: DashboardService,
    private weatherService: WeatherService,
    private alertService: AlertService
  ) {
    // Initialize form with FormBuilder
    this.filterForm = this.fb.group({
      searchText: [''],
      startDate: [''],
      endDate: [''],
      city: [this.city]
    });
  }

  ngOnInit() {
    this.loadDashboardData();
    this.loadCurrentWeather();
    this.loadActiveAlerts();
    this.loadForecast();
    this.loadAirQuality();
    this.loadUVIndex();
    this.loadMoonData();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadDashboardData() {
    this.loading.set(true);
    this.ngxService.start(); // Start loader
    
    this.dashboardService.getDashboardSummary(this.city).subscribe({
      next: (response) => {
        this.dashboardData.set(response.data);
        this.loading.set(false);
        this.error.set(null);
        this.ngxService.stop(); // Stop loader
        this.changeDetection.detectChanges();
      },
      error: (err) => {
        this.error.set('Failed to load dashboard data');
        this.loading.set(false);
        this.ngxService.stop(); // Stop loader
        console.error('Dashboard error:', err);
      }
    });
  }

  // Get report details with pagination
  getReportDetails() {
    this.ngxService.start(); // Start loader

    let details = {
      searchText: this.searchText,
      startDate: this.startDate,
      endDate: this.endDate,
      limit: this.pageSize,
      offset: this.pageIndex,
      isExport: false
    };
     
    this.dashboardService.getReportDetails(details).subscribe({
      next: (response: any) => {
        this.verifyPanReportDetails = response.data;
        this.noOfRecord = response.totalRecords;
        this.ngxService.stop(); // Stop loader
        this.changeDetection.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching report details:', error);
        this.error.set('Something Went Wrong');
        this.ngxService.stop(); // Stop loader
      }
    });
  }

  // Get user PAN change requests
  getUserPanChangeRequests() {
    this.ngxService.start(); // Start loader

    let details = {
      searchText: this.searchText,
      startDate: this.startDate,
      endDate: this.endDate,
      limit: this.pageSize,
      offset: this.pageIndex,
      isExport: false
    };
     
    this.dashboardService.getUserPanChangeRequests(details).subscribe({
      next: (response: any) => {
        this.verifyPanReportDetails = response.data;
        this.noOfRecord = response.totalRecords;
        this.ngxService.stop(); // Stop loader
        this.changeDetection.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching PAN change requests:', error);
        this.error.set('Something Went Wrong');
        this.ngxService.stop(); // Stop loader
      }
    });
  }

  loadForecast() {
    this.weatherService.getForecast().subscribe({
      next: (response) => {
        this.weekForecast.set(response.data);
      },
      error: (err) => {
        console.error('Forecast error:', err);
        this.weekForecast.set([]);
      }
    });
  }

  loadAirQuality() {
    this.weatherService.getAirQuality().subscribe({
      next: (response) => {
        this.airQualityData.set(response.data);
      },
      error: (err) => {
        console.error('Air quality error:', err);
        this.airQualityData.set(null);
      }
    });
  }

  loadUVIndex() {
    this.weatherService.getUVIndex().subscribe({
      next: (response) => {
        this.uvData.set(response.data);
      },
      error: (err) => {
        console.error('UV index error:', err);
        this.uvData.set(null);
      }
    });
  }

  loadMoonData() {
    this.weatherService.getMoonData().subscribe({
      next: (response) => {
        this.moonData.set(response.data);
      },
      error: (err) => {
        console.error('Moon data error:', err);
        this.moonData.set(null);
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
    this.loadForecast();
    this.loadAirQuality();
    this.loadUVIndex();
    this.loadMoonData();
  }

  private startAutoRefresh() {
    // Refresh dashboard and weather data every 10 minutes
    const dashboardSub = interval(600000)
      .pipe(startWith(0))
      .subscribe(() => {
        this.loadDashboardData();
        this.loadForecast();
        this.loadAirQuality();
        this.loadUVIndex();
        this.loadMoonData();
      });

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

