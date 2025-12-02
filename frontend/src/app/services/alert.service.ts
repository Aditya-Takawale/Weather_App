import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Alert, ApiResponse, PaginatedResponse } from '../models/weather.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private baseUrl = environment.apiUrl;
  private apiEndpoints = environment.apiEndpoints;

  constructor(private http: HttpClient) {}

  getActiveAlerts(city?: string, limit: number = 50): Observable<ApiResponse<Alert[]>> {
    let params = new HttpParams().set('limit', limit.toString());
    if (city) {
      params = params.set('city', city);
    }
    
    return this.http.get<ApiResponse<Alert[]>>(
      `${this.baseUrl}${this.apiEndpoints.alerts.active}`,
      { params }
    );
  }

  getAlertHistory(
    city?: string,
    page: number = 1,
    limit: number = 20,
    severity?: string,
    alertType?: string
  ): Observable<PaginatedResponse<Alert>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (city) params = params.set('city', city);
    if (severity) params = params.set('severity', severity);
    if (alertType) params = params.set('alertType', alertType);

    return this.http.get<PaginatedResponse<Alert>>(
      `${this.baseUrl}${this.apiEndpoints.alerts.history}`,
      { params }
    );
  }

  getAlertConfig(city: string = 'Pune', userId?: string): Observable<any> {
    let params = new HttpParams().set('city', city);
    if (userId) {
      params = params.set('userId', userId);
    }
    
    return this.http.get(
      `${this.baseUrl}${this.apiEndpoints.alerts.config}`,
      { params }
    );
  }

  updateAlertConfig(config: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}${this.apiEndpoints.alerts.update}`,
      config
    );
  }
}
