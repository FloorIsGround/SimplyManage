import type { NextFunction, Request, Response } from "express";
import { createStaffUser, updateUser, updateUserStatus } from "../models/user/userQueries.js";
import { createHttpError, requireUuid } from "./controllerHelpers.js";
import { USER_ROLES, USER_STATUSES } from "../models/user/user.js";
import type { CreateUserInput, UpdateUserInput } from "../models/user/userQueries.js";

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

// Updates a user's profile fields by their UUID.
export async function patchUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUuid(req.params.userId, "userId");
    const { email, firstName, lastName } = req.body;

    if ([email, firstName, lastName].every(v => v === undefined)) {
      throw createHttpError(400, "At least one field must be provided.");
    }

    const input: UpdateUserInput = {};
    if (email !== undefined) input.email = String(email).trim();
    if (firstName !== undefined) input.firstName = String(firstName).trim();
    if (lastName !== undefined) input.lastName = String(lastName).trim();

    const user = await updateUser(userId, input);

    if (!user) {
      throw createHttpError(404, "User not found.");
    }

    return res.json(user);
  } catch (err: any) {
    if (err?.code === "23505") {
      return next(createHttpError(409, "A user with that email already exists."));
    }
    next(err);
  }
}

// Updates a user's status by their UUID.
export async function patchUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUuid(req.params.userId, "userId");
    const { status } = req.body;

    if (!status || !USER_STATUSES.includes(status)) {
      throw createHttpError(400, `status must be one of: ${USER_STATUSES.join(", ")}.`);
    }

    const user = await updateUserStatus(userId, status);

    if (!user) {
      throw createHttpError(404, "User not found.");
    }

    return res.json(user);
  } catch (err) {
    next(err);
  }
}
