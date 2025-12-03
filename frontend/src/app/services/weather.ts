import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WeatherData, ApiResponse, PaginatedResponse } from '../models/weather.model';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private baseUrl = environment.apiUrl;
  private apiEndpoints = environment.apiEndpoints;

  constructor(private http: HttpClient) {}

  getCurrentWeather(city: string = 'Pune'): Observable<ApiResponse<WeatherData>> {
    const params = new HttpParams().set('city', city);
    return this.http.get<ApiResponse<WeatherData>>(
      `${this.baseUrl}${this.apiEndpoints.weather.current}`,
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
      `${this.baseUrl}${this.apiEndpoints.weather.history}`,
      { params }
    );
  }

  getForecast(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}${this.apiEndpoints.weather.forecast}`
    );
  }

  getAirQuality(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}${this.apiEndpoints.weather.airQuality}`
    );
  }

  getUVIndex(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}${this.apiEndpoints.weather.uvIndex}`
    );
  }

  getMoonData(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}${this.apiEndpoints.weather.moon}`
    );
  }
}
