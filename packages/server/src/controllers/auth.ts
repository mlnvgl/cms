import type { Request, Response } from "express";
import type { LoginRequest, LoginResponse, ApiResponse } from "@cms/shared";

/**
 * Stub authentication controller.
 * Replace with real auth (JWT, sessions, OAuth, etc.) when ready.
 */
export function login(
  req: Request<object, ApiResponse<LoginResponse>, LoginRequest>,
  res: Response<ApiResponse<LoginResponse>>,
) {
  const { email } = req.body;

  // TODO: validate credentials against a real user store
  const response: LoginResponse = {
    user: {
      id: "1",
      email,
      name: "Admin",
      role: "admin",
    },
    token: "stub-jwt-token",
  };

  res.json({ data: response });
}

export function me(_req: Request, res: Response) {
  // TODO: read user from JWT / session
  res.json({
    data: {
      id: "1",
      email: "admin@cms.local",
      name: "Admin",
      role: "admin",
    },
  });
}
