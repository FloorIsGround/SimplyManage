import type { NextFunction, Request, Response } from "express";

type PgLikeError = {
  code?: string;
  detail?: string;
};

type HttpLikeError = {
  status?: number;
  message?: string;
};

function isPgError(err: unknown): err is PgLikeError & { code: string } {
  return !!err && typeof err === "object" && typeof (err as PgLikeError).code === "string";
}

function mapPgError(err: PgLikeError & { code: string }): { status: number; message: string } {
  // Postgres error codes:
  switch (err.code) {
    case "23505": // unique
      return { status: 409, message: "Duplicate value violates a unique constraint." };
    case "23503": // foreign key
      return { status: 409, message: "Record does not exist." };
    case "23502": // not null
      return { status: 400, message: "Missing required field." };
    case "23514": // check violation
      return { status: 400, message: "Invalid Value." };
    default:
      return { status: 500, message: "Database error." };
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not Found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const e = err as HttpLikeError;

  // If an error was thrown with a status code, use it
  if (e && typeof e === "object" && typeof e.status === "number") {
    res.status(e.status).json({ error: e.message || "Error" });
    return;
  }

  // Map Postgres errors to responses
  if (isPgError(err)) {
    const mapped = mapPgError(err);
    res.status(mapped.status).json({
      error: mapped.message,
      detail: process.env.NODE_ENV === "development" ? err.detail : undefined
    });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
}
