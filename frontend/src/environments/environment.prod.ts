export const environment = {
  production: true,
  apiUrl: 'https://your-production-domain.com/api',
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
