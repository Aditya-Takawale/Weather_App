import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware to check for errors
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return next();
};

/**
 * Weather query validation
 */
export const weatherQueryValidation = [
  query('city').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  validate
];

/**
 * Dashboard query validation
 */
export const dashboardQueryValidation = [
  query('city').optional().isString().trim(),
  query('refresh').optional().isBoolean(),
  query('hours').optional().isInt({ min: 1, max: 168 }),
  validate
];

/**
 * Alert query validation
 */
export const alertQueryValidation = [
  query('city').optional().isString().trim(),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('alertType').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate
];

/**
 * Alert config validation
 */
export const alertConfigValidation = [
  body('city').isString().trim().notEmpty(),
  body('userId').optional().isString().trim(),
  body('temperatureThreshold').optional().isFloat(),
  body('windSpeedThreshold').optional().isFloat(),
  body('humidityThreshold').optional().isFloat(),
  validate
];
