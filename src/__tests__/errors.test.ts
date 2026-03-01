import { describe, it, expect } from "vitest";
import {
  AppError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  errorResponse,
} from "@/lib/utils/errors";

describe("Error classes", () => {
  it("AppError has correct defaults", () => {
    const err = new AppError("test");
    expect(err.message).toBe("test");
    expect(err.statusCode).toBe(500);
    expect(err.name).toBe("AppError");
  });

  it("AuthError returns 401", () => {
    const err = new AuthError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("AUTH_REQUIRED");
    expect(err.message).toBe("Authentication required");
  });

  it("ForbiddenError returns 403", () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });

  it("NotFoundError returns 404 with resource name", () => {
    const err = new NotFoundError("Project");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Project not found");
    expect(err.code).toBe("NOT_FOUND");
  });

  it("ValidationError returns 400", () => {
    const err = new ValidationError("Invalid input");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Invalid input");
    expect(err.code).toBe("VALIDATION_ERROR");
  });

  it("RateLimitError returns 429", () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("RATE_LIMIT");
  });

  it("all errors extend AppError", () => {
    expect(new AuthError()).toBeInstanceOf(AppError);
    expect(new ForbiddenError()).toBeInstanceOf(AppError);
    expect(new NotFoundError()).toBeInstanceOf(AppError);
    expect(new ValidationError("x")).toBeInstanceOf(AppError);
    expect(new RateLimitError()).toBeInstanceOf(AppError);
  });
});

describe("errorResponse", () => {
  it("returns correct status for AppError", async () => {
    const res = errorResponse(new AuthError());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Authentication required");
    expect(body.code).toBe("AUTH_REQUIRED");
  });

  it("returns correct status for ValidationError", async () => {
    const res = errorResponse(new ValidationError("Bad input"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Bad input");
  });

  it("returns 500 for unknown errors", async () => {
    const res = errorResponse(new Error("random"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
  });

  it("returns 500 for non-Error objects", async () => {
    const res = errorResponse("string error");
    expect(res.status).toBe(500);
  });
});
