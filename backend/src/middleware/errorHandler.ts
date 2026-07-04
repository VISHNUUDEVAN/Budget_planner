import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

/**
 * Create a typed application error
 */
export function createError(
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_SERVER_ERROR'
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
