import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Error handling middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: statusCode,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(404).json({
    status: 404,
    message: `Route ${req.url} not found`
  });
};

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};
