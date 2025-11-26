import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WeatherData, ApiResponse, PaginatedResponse } from '../models/weather.model';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCurrentWeather(city: string = 'Pune'): Observable<ApiResponse<WeatherData>> {
    const params = new HttpParams().set('city', city);
    return this.http.get<ApiResponse<WeatherData>>(
      `${this.apiUrl}${environment.apiEndpoints.weather.current}`,
      { params }
    );
  }

  getWeatherHistory(
    city: string = 'Pune',
    page: number = 1,
    limit: number = 50,
    startDate?: Date,
    endDate?: Date
  ): Observable<PaginatedResponse<WeatherData>> {
    let params = new HttpParams()
      .set('city', city)
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http.get<PaginatedResponse<WeatherData>>(
      `${this.apiUrl}${environment.apiEndpoints.weather.history}`,
      { params }
    );
  }
}
