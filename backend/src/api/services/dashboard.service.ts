import RawWeatherData, { IRawWeatherData } from '../models/RawWeatherData';
import DashboardSummary from '../models/DashboardSummary';
import logger from '../config/logger';

/**
 * Dashboard Service
 * Handles aggregation and computation of dashboard summary data
 */

class DashboardService {
  /**
   * Compute summary data from raw weather records
   */
  async computeSummary(city = 'Pune'): Promise<any> {
    try {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);

      // Fetch today's raw data
      const todayDataQuery = RawWeatherData.findActive({
        city,
        timestamp: { $gte: startOfToday }
      });
      const todayData = await todayDataQuery.sort({ timestamp: 1 });

      // Fetch yesterday's data for comparison
      const yesterdayData = await RawWeatherData.findActive({
        city,
        timestamp: { $gte: startOfYesterday, $lt: startOfToday }
      });

      // Get latest data point
      const latestData = await RawWeatherData.getLatest(city);

      if (!latestData) {
        logger.warn(`No weather data available for ${city}`);
        return null;
      }

      // Compute current metrics
      const current = {
        temperature: latestData.temperature,
        feelsLike: latestData.feelsLike,
        humidity: latestData.humidity,
        pressure: latestData.pressure,
        windSpeed: latestData.windSpeed,
        weatherCondition: latestData.weatherMain,
        weatherDescription: latestData.weatherDescription,
        timestamp: latestData.timestamp
      };

      // Compute today's aggregated metrics
      const today = this.computeTodayMetrics(todayData);

      // Compute hourly trends (last 48 hours)
      const hourlyTrends = await this.computeHourlyTrends(city);

      // Compute yesterday's metrics
      const yesterday = this.computeYesterdayMetrics(yesterdayData);

      // Compute statistics
      const stats = this.computeStats(todayData);

      const summary = {
        city,
        summaryDate: startOfToday,
        current,
        today,
        hourlyTrends,
        yesterday,
        stats
      };

      return summary;

    } catch (error) {
      logger.error(`Error computing summary: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Compute today's aggregated metrics
   */
  computeTodayMetrics(data: IRawWeatherData[]) {
    if (!data || data.length === 0) {
      return {
        avgTemperature: 0,
        minTemperature: 0,
        maxTemperature: 0,
        avgHumidity: 0,
        avgPressure: 0,
        avgWindSpeed: 0,
        dominantWeather: 'N/A',
        dataPointsCount: 0
      };
    }

    const temperatures = data.map(d => d.temperature);
    const humidities = data.map(d => d.humidity);
    const pressures = data.map(d => d.pressure);
    const windSpeeds = data.map(d => d.windSpeed);

    // Calculate averages
    const avgTemperature = this.average(temperatures);
    const avgHumidity = this.average(humidities);
    const avgPressure = this.average(pressures);
    const avgWindSpeed = this.average(windSpeeds);

    // Min/Max temperature
    const minTemperature = Math.min(...temperatures);
    const maxTemperature = Math.max(...temperatures);

    // Dominant weather condition
    const dominantWeather = this.getMostFrequent(data.map(d => d.weatherMain));

    return {
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      minTemperature: Math.round(minTemperature * 10) / 10,
      maxTemperature: Math.round(maxTemperature * 10) / 10,
      avgHumidity: Math.round(avgHumidity),
      avgPressure: Math.round(avgPressure),
      avgWindSpeed: Math.round(avgWindSpeed * 10) / 10,
      dominantWeather,
      dataPointsCount: data.length
    };
  }

  /**
   * Compute hourly trends for the last 48 hours
   */
  async computeHourlyTrends(city: string) {
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const dataQuery = RawWeatherData.findActive({
      city,
      timestamp: { $gte: fortyEightHoursAgo }
    });
    const data = await dataQuery.sort({ timestamp: 1 });

    // Group data by hour
    const hourlyGroups: Record<string, IRawWeatherData[]> = {};

    data.forEach((record: IRawWeatherData) => {
      const hour = new Date(record.timestamp);
      hour.setMinutes(0, 0, 0);
      const hourKey = hour.toISOString();

      if (!hourlyGroups[hourKey]) {
        hourlyGroups[hourKey] = [];
      }
      hourlyGroups[hourKey].push(record);
    });

    // Compute averages for each hour
    const trends = Object.keys(hourlyGroups)
      .sort()
      .slice(-48) // Keep only last 48 hours
      .map(hourKey => {
        const records = hourlyGroups[hourKey];
        return {
          hour: new Date(hourKey),
          avgTemperature: Math.round(this.average(records.map(r => r.temperature)) * 10) / 10,
          avgHumidity: Math.round(this.average(records.map(r => r.humidity))),
          avgPressure: Math.round(this.average(records.map(r => r.pressure))),
          weatherCondition: this.getMostFrequent(records.map(r => r.weatherMain))
        };
      });

    return trends;
  }

  /**
   * Compute yesterday's metrics
   */
  computeYesterdayMetrics(data: IRawWeatherData[]) {
    if (!data || data.length === 0) {
      return {
        avgTemperature: 0,
        maxTemperature: 0,
        minTemperature: 0
      };
    }

    const temperatures = data.map(d => d.temperature);
    
    return {
      avgTemperature: Math.round(this.average(temperatures) * 10) / 10,
      maxTemperature: Math.round(Math.max(...temperatures) * 10) / 10,
      minTemperature: Math.round(Math.min(...temperatures) * 10) / 10
    };
  }

  /**
   * Compute statistics
   */
  computeStats(data: IRawWeatherData[]) {
    if (!data || data.length === 0) {
      return {
        temperatureVariance: 0,
        humidityRange: 0,
        weatherChangeCount: 0
      };
    }

    const temperatures = data.map(d => d.temperature);
    const humidities = data.map(d => d.humidity);

    // Temperature variance
    const avgTemp = this.average(temperatures);
    const variance = temperatures.reduce((sum, t) => sum + Math.pow(t - avgTemp, 2), 0) / temperatures.length;

    // Humidity range
    const humidityRange = Math.max(...humidities) - Math.min(...humidities);

    // Weather change count
    let weatherChangeCount = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i].weatherMain !== data[i - 1].weatherMain) {
        weatherChangeCount++;
      }
    }

    return {
      temperatureVariance: Math.round(variance * 100) / 100,
      humidityRange: Math.round(humidityRange),
      weatherChangeCount
    };
  }

  /**
   * Save or update dashboard summary
   */
  async saveSummary(summary: any) {
    try {
      const result = await DashboardSummary.upsertSummary(
        summary.city,
        summary.summaryDate,
        summary
      );

      logger.info(`✅ Dashboard summary saved for ${summary.city}`);
      return result;

    } catch (error) {
      logger.error(`Failed to save dashboard summary: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Helper: Calculate average
   */
  average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  /**
   * Helper: Get most frequent value
   */
  getMostFrequent(arr: string[]): string {
    if (arr.length === 0) return 'N/A';
    
    const frequency: Record<string, number> = {};
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });

    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }

  /**
   * Get dashboard summary (cached or fresh)
   */
  async getDashboardSummary(city: string, forceRefresh: boolean) {
    let summary;
    
    if (forceRefresh) {
      logger.info(`Force refresh requested for ${city} dashboard`);
      summary = await this.computeSummary(city);
      if (summary) {
        await this.saveSummary(summary);
      }
    } else {
      summary = await DashboardSummary.getLatest(city);
      
      if (!summary) {
        logger.warn(`No cached summary for ${city}, computing fresh data`);
        summary = await this.computeSummary(city);
        if (summary) {
          await this.saveSummary(summary);
        }
      }
    }
    
    return summary;
  }

  /**
   * Get hourly trends
   */
  async getHourlyTrends(city: string, hours: number) {
    return await this.computeHourlyTrends(city);
  }

  /**
   * Get report details with pagination
   */
  async getReportDetails(params: any) {
    // Placeholder for report generation logic
    // This would typically query the database with filters
    return {
      status: 200,
      totalRecords: 0,
      data: []
    };
  }

  /**
   * Export dashboard data
   */
  async exportData(params: any) {
    // Placeholder for export logic
    return {
      exported: true,
      format: 'json',
      data: []
    };
  }
}

export default new DashboardService();
