import type { NextFunction, Request, Response } from "express";
import { createStaffUser } from "../models/user/userQueries.js";
import { createHttpError } from "./controllerHelpers.js";
import { USER_ROLES } from "../models/user/user.js";
import type { CreateUserInput } from "../models/user/userQueries.js";

// Creates a new user (staff-initiated).
export async function postUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || typeof email !== "string") throw createHttpError(400, "email is required.");
    if (!password || typeof password !== "string") throw createHttpError(400, "password is required.");
    if (!firstName || typeof firstName !== "string") throw createHttpError(400, "firstName is required.");
    if (!lastName || typeof lastName !== "string") throw createHttpError(400, "lastName is required.");
    if (role !== undefined && !USER_ROLES.includes(role)) {
      throw createHttpError(400, `role must be one of: ${USER_ROLES.join(", ")}.`);
    }

    const input: CreateUserInput = {
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role ?? undefined,
    };

    const user = await createStaffUser(input);
    return res.status(201).json(user);
  } catch (err: any) {
    if (err?.code === "23505") {
      return next(createHttpError(409, "A user with that email already exists."));
    }
    next(err);
  }
}
