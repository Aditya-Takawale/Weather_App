import { signal, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

import { DashboardService } from '../../services/dashboard';
import { WeatherService } from '../../services/weather';
import { AlertService } from '../../services/alert';
import { DashboardSummary, WeatherData, Alert } from '../../models/weather.model';

export class DashboardHook {
  // Signals
  dashboardData = signal<DashboardSummary | null>(null);
  currentWeather = signal<WeatherData | null>(null);
  activeAlerts = signal<Alert[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  weekForecast = signal<any[]>([]);
  airQualityData = signal<any>(null);
  uvData = signal<any>(null);
  moonData = signal<any>(null);

  // Properties
  private subscriptions: Subscription[] = [];
  readonly city = 'Pune';
  verifyPanReportDetails: any[] = [];
  noOfRecord: number = 0;
  searchText: string = '';
  startDate: string = '';
  endDate: string = '';
  pageSize: number = 10;
  pageIndex: number = 0;
  mapLayer = 'alerts';
  currentTime = new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Form
  filterForm: FormGroup;

  constructor(
    protected router: Router,
    protected fb: FormBuilder,
    protected ngxService: NgxUiLoaderService,
    protected dashboardService: DashboardService,
    protected weatherService: WeatherService,
    protected alertService: AlertService
  ) {
    this.filterForm = this.fb.group({
      searchText: [''],
      startDate: [''],
      endDate: [''],
      city: [this.city]
    });
  }

  // Lifecycle methods
  onInit() {
    this.loadDashboardData();
    this.loadCurrentWeather();
    this.loadActiveAlerts();
    this.loadForecast();
    this.loadAirQuality();
    this.loadUVIndex();
    this.loadMoonData();
    this.startAutoRefresh();
  }

  onDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Data loading methods
  loadDashboardData() {
    this.loading.set(true);
    this.ngxService.start();
    
    this.dashboardService.getDashboardSummary(this.city).subscribe({
      next: (response) => {
        this.dashboardData.set(response.data);
        this.loading.set(false);
        this.error.set(null);
        this.ngxService.stop();
      },
      error: (err) => {
        this.error.set('Failed to load dashboard data');
        this.loading.set(false);
        this.ngxService.stop();
        console.error('Dashboard error:', err);
      }
    });
  }

  loadCurrentWeather() {
    this.weatherService.getCurrentWeather().subscribe({
      next: (response) => {
        this.currentWeather.set(response.data);
      },
      error: (err) => {
        console.error('Weather error:', err);
      }
    });
  }

  loadActiveAlerts() {
    this.alertService.getActiveAlerts().subscribe({
      next: (response) => {
        this.activeAlerts.set(response.data);
      },
      error: (err) => {
        console.error('Alerts error:', err);
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
      }
    });
  }

  // Report methods
  getReportDetails() {
    this.ngxService.start();

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
        this.ngxService.stop();
      },
      error: (error: any) => {
        console.error('Error fetching report details:', error);
        this.error.set('Something Went Wrong');
        this.ngxService.stop();
      }
    });
  }

  getUserPanChangeRequests() {
    this.ngxService.start();

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
        this.ngxService.stop();
      },
      error: (error: any) => {
        console.error('Error fetching PAN change requests:', error);
        this.error.set('Something Went Wrong');
        this.ngxService.stop();
      }
    });
  }

  // UI methods
  refreshData() {
    this.loadDashboardData();
    this.loadCurrentWeather();
    this.loadActiveAlerts();
    this.loadForecast();
    this.loadAirQuality();
    this.loadUVIndex();
    this.loadMoonData();
  }

  startAutoRefresh() {
    const refreshInterval = interval(300000); // 5 minutes
    const sub = refreshInterval.pipe(
      startWith(0),
      switchMap(() => this.dashboardService.getDashboardSummary(this.city))
    ).subscribe({
      next: (response) => {
        this.dashboardData.set(response.data);
      },
      error: (err) => {
        console.error('Auto-refresh error:', err);
      }
    });
    this.subscriptions.push(sub);
  }

  onMapLayerChange(layer: string) {
    this.mapLayer = layer;
  }

  onFilterChange() {
    const formValues = this.filterForm.value;
    this.searchText = formValues.searchText;
    this.startDate = formValues.startDate;
    this.endDate = formValues.endDate;
    this.getReportDetails();
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getReportDetails();
  }

  exportData() {
    this.ngxService.start();

    let details = {
      searchText: this.searchText,
      startDate: this.startDate,
      endDate: this.endDate,
      isExport: true
    };

    this.dashboardService.exportData(details).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        console.log('Export successful:', response);
      },
      error: (error: any) => {
        console.error('Export error:', error);
        this.error.set('Export failed');
        this.ngxService.stop();
      }
    });
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
