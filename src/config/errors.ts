import type { Request, Response, NextFunction } from "express";

export class CustomError extends Error {
  error_code: string;
  status_code: number;

  constructor({
    message,
    error_code,
    status_code,
  }: {
    message: string;
    error_code: string;
    status_code?: number;
  }) {
    super(message);
    this.error_code = error_code;
    this.status_code = status_code || 500;
  }
}

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(error.status_code).json({
    message: error.message,
    errorCode: error.error_code,
    statusCode: error.status_code,
  });
};
