export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiEndpoints: {
    weather: {
      current: '/weather/current',
      history: '/weather/history',
      forecast: '/weather/forecast',
      airQuality: '/weather/air-quality',
      uvIndex: '/weather/uv-index',
      moon: '/weather/moon'
    },
    dashboard: {
      summary: '/dashboard/summary',
      trends: '/dashboard/trends',
      reports: '/dashboard/reports',
      export: '/dashboard/export'
    },
    alerts: {
      active: '/alerts/active',
      history: '/alerts/history',
      config: '/alerts/config',
      update: '/alerts/config',
      delete: '/alerts/config'
    },
    admin: {
      panChangeRequests: '/adminApi/getUserPanChangeRequests'
    }
  },
  refreshIntervals: {
    weather: 300000,      // 5 minutes
    dashboard: 600000,    // 10 minutes
    alerts: 60000         // 1 minute
  }
};
