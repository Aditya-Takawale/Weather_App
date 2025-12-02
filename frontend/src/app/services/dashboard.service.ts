import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardSummary, ApiResponse } from '../models/weather.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = environment.apiUrl;
  private apiEndpoints = environment.apiEndpoints;

  constructor(private http: HttpClient) {}

  getDashboardSummary(city: string = 'Pune', forceRefresh: boolean = false): Observable<ApiResponse<DashboardSummary>> {
    const params = new HttpParams()
      .set('city', city)
      .set('refresh', forceRefresh.toString());
    
    return this.http.get<ApiResponse<DashboardSummary>>(
      `${this.baseUrl}${this.apiEndpoints.dashboard.summary}`,
      { params }
    );
  }

  getHourlyTrends(city: string = 'Pune', hours: number = 48): Observable<any> {
    const params = new HttpParams()
      .set('city', city)
      .set('hours', hours.toString());
    
    return this.http.get(
      `${this.baseUrl}${this.apiEndpoints.dashboard.trends}`,
      { params }
    );
  }

  // Weather Dashboard specific API calls
  getReportDetails(details: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}${this.apiEndpoints.dashboard.reports}`,
      details,
      { withCredentials: false }
    );
  }

  getUserPanChangeRequests(details: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}${this.apiEndpoints.admin.panChangeRequests}`,
      details,
      { withCredentials: false }
    );
  }

  exportData(details: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}${this.apiEndpoints.dashboard.export}`,
      { ...details, isExport: true },
      { withCredentials: false }
    );
  }
}
