export interface WeatherQueryParams {
  city?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface DashboardQueryParams {
  city?: string;
  refresh?: boolean;
  hours?: number;
}

export interface AlertQueryParams {
  city?: string;
  severity?: string;
  alertType?: string;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
