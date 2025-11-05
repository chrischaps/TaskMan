import { Request, Response, NextFunction } from 'express';

// Error response interface
interface ErrorResponse {
  message: string;
  error?: string;
  stack?: string;
}

// Global error handler middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error to console
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Default to 500 server error
  const statusCode = err.statusCode || 500;

  // Build error response
  const errorResponse: ErrorResponse = {
    message: err.message || 'Internal server error',
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = err.name;
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// 404 Not Found handler
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const error: any = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async error wrapper to catch errors in async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
