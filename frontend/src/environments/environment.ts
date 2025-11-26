export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiEndpoints: {
    weather: {
      current: '/weather/current',
      history: '/weather/history'
    },
    dashboard: {
      summary: '/dashboard/summary',
      trends: '/dashboard/trends'
    },
    alerts: {
      active: '/alerts/active',
      history: '/alerts/history',
      config: '/alerts/config'
    }
  },
  refreshIntervals: {
    weather: 300000,      // 5 minutes
    dashboard: 600000,    // 10 minutes
    alerts: 60000         // 1 minute
  }
};
