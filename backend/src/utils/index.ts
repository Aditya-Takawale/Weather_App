/**
 * Format date to ISO string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Parse pagination parameters
 */
export const parsePagination = (page?: string, limit?: string) => {
  const parsedPage = parseInt(page || '1', 10);
  const parsedLimit = parseInt(limit || '20', 10);
  
  return {
    page: Math.max(1, parsedPage),
    limit: Math.min(100, Math.max(1, parsedLimit)),
    skip: (Math.max(1, parsedPage) - 1) * Math.min(100, Math.max(1, parsedLimit))
  };
};

/**
 * Calculate pagination metadata
 */
export const calculatePagination = (
  totalItems: number,
  page: number,
  limit: number
) => {
  return {
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: limit
  };
};

/**
 * Generate success response
 */
export const successResponse = <T>(
  data: T,
  message: string = 'Success',
  status: number = 200
) => {
  return {
    status,
    message,
    data
  };
};

/**
 * Generate error response
 */
export const errorResponse = (
  message: string = 'Error occurred',
  status: number = 500
) => {
  return {
    status,
    message,
    error: message
  };
};

/**
 * Delay execution
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry async operation
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await delay(delayMs);
      }
    }
  }
  
  throw lastError!;
};
