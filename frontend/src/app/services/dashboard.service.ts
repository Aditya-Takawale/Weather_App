import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardSummary, ApiResponse } from '../models/weather.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getDashboardSummary(city: string = 'Pune', forceRefresh: boolean = false): Observable<ApiResponse<DashboardSummary>> {
    const params = new HttpParams()
      .set('city', city)
      .set('refresh', forceRefresh.toString());
    
    return this.http.get<ApiResponse<DashboardSummary>>(
      `${this.apiUrl}${environment.apiEndpoints.dashboard.summary}`,
      { params }
    );
  }

  getHourlyTrends(city: string = 'Pune', hours: number = 48): Observable<any> {
    const params = new HttpParams()
      .set('city', city)
      .set('hours', hours.toString());
    
    return this.http.get(
      `${this.apiUrl}${environment.apiEndpoints.dashboard.trends}`,
      { params }
    );
  }
}
