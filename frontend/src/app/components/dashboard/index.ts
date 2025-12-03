import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { NgxUiLoaderService, NgxUiLoaderModule } from 'ngx-ui-loader';

import { DashboardService } from '../../services/dashboard';
import { WeatherService } from '../../services/weather';
import { AlertService } from '../../services/alert';
import { DashboardHook } from './index.hook';

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
  templateUrl: './index.html',
  styleUrls: ['./index.scss']
})
export class DashboardComponent extends DashboardHook implements OnInit, OnDestroy {
  constructor(
    private changeDetection: ChangeDetectorRef,
    router: Router,
    fb: FormBuilder,
    ngxService: NgxUiLoaderService,
    dashboardService: DashboardService,
    weatherService: WeatherService,
    alertService: AlertService
  ) {
    super(router, fb, ngxService, dashboardService, weatherService, alertService);
  }

  ngOnInit() {
    this.onInit();
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  // Override methods that need ChangeDetectorRef
  override loadDashboardData() {
    this.loading.set(true);
    this.ngxService.start();
    
    this.dashboardService.getDashboardSummary(this.city).subscribe({
      next: (response) => {
        this.dashboardData.set(response.data);
        this.loading.set(false);
        this.error.set(null);
        this.ngxService.stop();
        this.changeDetection.detectChanges();
      },
      error: (err) => {
        this.error.set('Failed to load dashboard data');
        this.loading.set(false);
        this.ngxService.stop();
        console.error('Dashboard error:', err);
      }
    });
  }

  override getReportDetails() {
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
        this.changeDetection.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching report details:', error);
        this.error.set('Something Went Wrong');
        this.ngxService.stop();
      }
    });
  }

  override getUserPanChangeRequests() {
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
        this.changeDetection.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching PAN change requests:', error);
        this.error.set('Something Went Wrong');
        this.ngxService.stop();
      }
    });
  }
}
