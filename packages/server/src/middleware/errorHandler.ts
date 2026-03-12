import type { Request, Response, NextFunction } from "express";
import type { ApiError } from "@cms/shared";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiError>,
  _next: NextFunction,
) {
  console.error("[error]", err.message);

  const statusCode = (err as any).statusCode ?? 500;

  res.status(statusCode).json({
    error: err.name,
    message: err.message,
    statusCode,
  });
}
