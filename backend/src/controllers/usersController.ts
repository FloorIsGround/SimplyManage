import type { NextFunction, Request, Response } from "express";
import { getUserByEmail, createStaffUser, updateUser, updateUserStatus, updateUserPassword, verifyUserPassword, deleteUser } from "../models/user/userQueries.js";
import { createHttpError, requireUuid } from "./controllerHelpers.js";
import { USER_ROLES, USER_STATUSES } from "../models/user/user.js";
import type { CreateUserInput, UpdateUserInput } from "../models/user/userQueries.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Logs in a user by email and password, returning a signed JWT.
export async function postLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createHttpError(400, "Email and password are required.");
    }

    const user = await getUserByEmail(email);
    if (!user) {
      throw createHttpError(401, "Email or password is incorrect.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw createHttpError(401, "Email or password is incorrect.");
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "changeme",
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (err) {
    next(err);
  }
}

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

// Verifies a plain-text password against the stored hash for a user.
export async function postVerifyPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUuid(req.params.userId, "userId");
    const { password } = req.body;

    if (!password || typeof password !== "string") {
      throw createHttpError(400, "password is required.");
    }

    const valid = await verifyUserPassword(userId, password);

    if (!valid) {
      throw createHttpError(401, "Password is incorrect.");
    }

    return res.json({ valid: true });
  } catch (err) {
    next(err);
  }
}

// Updates a user's password by their UUID.
export async function patchUserPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUuid(req.params.userId, "userId");
    const { password } = req.body;

    if (!password || typeof password !== "string") {
      throw createHttpError(400, "password is required.");
    }

    const updated = await updateUserPassword(userId, password);

    if (!updated) {
      throw createHttpError(404, "User not found.");
    }

    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
}

// Deletes a user by their UUID.
export async function removeUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUuid(req.params.userId, "userId");
    const deleted = await deleteUser(userId);

    if (!deleted) {
      throw createHttpError(404, "User not found.");
    }

    return res.json({ message: "User deleted successfully." });
  } catch (err: any) {
    if (err?.code === "23503") {
      return next(createHttpError(409, "Cannot delete user with active loans or holds."));
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
