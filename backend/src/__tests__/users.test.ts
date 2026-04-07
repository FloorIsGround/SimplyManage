import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import type { User } from "../models/user/user.js";

// Mock the entire user query layer so tests never touch the database.
vi.mock("../models/user/userQueries.js", () => ({
  getUserByEmail: vi.fn(),
  createStaffUser: vi.fn(),
  updateUser: vi.fn(),
  updateUserStatus: vi.fn(),
  updateUserPassword: vi.fn(),
  verifyUserPassword: vi.fn(),
  deleteUser: vi.fn(),
}));

// Mock bcrypt and jwt so login tests don't run real hashing.
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn().mockReturnValue("mock.jwt.token"),
  },
}));

import {
  getUserByEmail,
  createStaffUser,
  updateUser,
  updateUserStatus,
  updateUserPassword,
  verifyUserPassword,
  deleteUser,
} from "../models/user/userQueries.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const mockGetUserByEmail = vi.mocked(getUserByEmail);
const mockCreateStaffUser = vi.mocked(createStaffUser);
const mockUpdateUser = vi.mocked(updateUser);
const mockUpdateUserStatus = vi.mocked(updateUserStatus);
const mockUpdateUserPassword = vi.mocked(updateUserPassword);
const mockVerifyUserPassword = vi.mocked(verifyUserPassword);
const mockDeleteUser = vi.mocked(deleteUser);
const mockBcryptCompare = vi.mocked(bcrypt.compare);

const app = createApp();

const sampleUser: User = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  role: "PATRON",
  status: "ACTIVE",
  createdAt: "2024-01-01T00:00:00.000Z",
};

// Raw shape returned by getUserByEmail (includes password_hash).
const sampleUserRow = {
  user_id: sampleUser.id,
  email: sampleUser.email,
  password_hash: "$2b$10$hashedpassword",
  role: sampleUser.role,
  status: sampleUser.status,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// POST /api/users/login
// ---------------------------------------------------------------------------
describe("POST /api/users/login", () => {
  it("returns a token on valid credentials", async () => {
    mockGetUserByEmail.mockResolvedValue(sampleUserRow);
    mockBcryptCompare.mockResolvedValue(true as never);

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token", "mock.jwt.token");
    expect(jwt.sign).toHaveBeenCalled();
  });

  it("returns 400 when fields are missing", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(400);
  });

  it("returns 401 when user does not exist", async () => {
    mockGetUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "unknown@example.com", password: "password123" });

    expect(res.status).toBe(401);
  });

  it("returns 401 when password is incorrect", async () => {
    mockGetUserByEmail.mockResolvedValue(sampleUserRow);
    mockBcryptCompare.mockResolvedValue(false as never);

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// POST /api/users
// ---------------------------------------------------------------------------
describe("POST /api/users", () => {
  const newUserBody = {
    email: "new@example.com",
    password: "password123",
    firstName: "New",
    lastName: "User",
  };

  it("creates a user and returns 201", async () => {
    mockCreateStaffUser.mockResolvedValue(sampleUser);

    const res = await request(app).post("/api/users").send(newUserBody);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(sampleUser);
  });

  it("creates a user with an explicit role", async () => {
    const librarianUser = { ...sampleUser, role: "LIBRARIAN" as const };
    mockCreateStaffUser.mockResolvedValue(librarianUser);

    const res = await request(app)
      .post("/api/users")
      .send({ ...newUserBody, role: "LIBRARIAN" });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("LIBRARIAN");
  });

  it("returns 400 when a required field is missing", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ ...newUserBody, email: undefined });

    expect(res.status).toBe(400);
  });

  it("returns 400 when role is invalid", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ ...newUserBody, role: "SUPERADMIN" });

    expect(res.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    const duplicateError = Object.assign(new Error("unique violation"), { code: "23505" });
    mockCreateStaffUser.mockRejectedValue(duplicateError);

    const res = await request(app).post("/api/users").send(newUserBody);

    expect(res.status).toBe(409);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/users/:userId
// ---------------------------------------------------------------------------
describe("PATCH /api/users/:userId", () => {
  it("updates a user and returns the updated user", async () => {
    const updated = { ...sampleUser, firstName: "Updated" };
    mockUpdateUser.mockResolvedValue(updated);

    const res = await request(app)
      .patch(`/api/users/${sampleUser.id}`)
      .send({ firstName: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("Updated");
  });

  it("returns 400 when no fields are provided", async () => {
    const res = await request(app)
      .patch(`/api/users/${sampleUser.id}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid userId UUID", async () => {
    const res = await request(app)
      .patch("/api/users/not-a-uuid")
      .send({ firstName: "Test" });

    expect(res.status).toBe(400);
  });

  it("returns 404 when user does not exist", async () => {
    mockUpdateUser.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/users/${sampleUser.id}`)
      .send({ firstName: "Ghost" });

    expect(res.status).toBe(404);
  });

  it("returns 409 when updated email already exists", async () => {
    const duplicateError = Object.assign(new Error("unique violation"), { code: "23505" });
    mockUpdateUser.mockRejectedValue(duplicateError);

    const res = await request(app)
      .patch(`/api/users/${sampleUser.id}`)
      .send({ email: "taken@example.com" });

    expect(res.status).toBe(409);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/users/:userId/status
// ---------------------------------------------------------------------------
describe("PATCH /api/users/:userId/status", () => {
  it("updates the status and returns the updated user", async () => {
    const updated = { ...sampleUser, status: "SUSPENDED" as const };
    mockUpdateUserStatus.mockResolvedValue(updated);

    const res = await request(app)
      .patch(`/api/users/${sampleUser.id}/status`)
      .send({ status: "SUSPENDED" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("SUSPENDED");
  });

  it("returns 400 when status is invalid", async () => {
    const res = await request(app)
      .patch(`/api/users/${sampleUser.id}/status`)
      .send({ status: "BANNED" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when status is missing", async () => {
    const res = await request(app)
      .patch(`/api/users/${sampleUser.id}/status`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 404 when user does not exist", async () => {
    mockUpdateUserStatus.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/users/${sampleUser.id}/status`)
      .send({ status: "ACTIVE" });

    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/users/:userId/password
// ---------------------------------------------------------------------------
describe("PATCH /api/users/:userId/password", () => {
  it("updates the password and returns a success message", async () => {
    mockUpdateUserPassword.mockResolvedValue(true);

    const res = await request(app)
      .patch(`/api/users/${sampleUser.id}/password`)
      .send({ password: "newpassword123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .patch(`/api/users/${sampleUser.id}/password`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 404 when user does not exist", async () => {
    mockUpdateUserPassword.mockResolvedValue(false);

    const res = await request(app)
      .patch(`/api/users/${sampleUser.id}/password`)
      .send({ password: "newpassword123" });

    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /api/users/:userId/verify-password
// ---------------------------------------------------------------------------
describe("POST /api/users/:userId/verify-password", () => {
  it("returns valid: true when password matches", async () => {
    mockVerifyUserPassword.mockResolvedValue(true);

    const res = await request(app)
      .post(`/api/users/${sampleUser.id}/verify-password`)
      .send({ password: "correctpassword" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ valid: true });
  });

  it("returns 401 when password does not match", async () => {
    mockVerifyUserPassword.mockResolvedValue(false);

    const res = await request(app)
      .post(`/api/users/${sampleUser.id}/verify-password`)
      .send({ password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post(`/api/users/${sampleUser.id}/verify-password`)
      .send({});

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/users/:userId
// ---------------------------------------------------------------------------
describe("DELETE /api/users/:userId", () => {
  it("deletes a user and returns a success message", async () => {
    mockDeleteUser.mockResolvedValue(true);

    const res = await request(app).delete(`/api/users/${sampleUser.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 400 for an invalid userId UUID", async () => {
    const res = await request(app).delete("/api/users/not-a-uuid");

    expect(res.status).toBe(400);
  });

  it("returns 404 when user does not exist", async () => {
    mockDeleteUser.mockResolvedValue(false);

    const res = await request(app).delete(`/api/users/${sampleUser.id}`);

    expect(res.status).toBe(404);
  });

  it("returns 409 when user has active loans or holds", async () => {
    const fkError = Object.assign(new Error("foreign key violation"), { code: "23503" });
    mockDeleteUser.mockRejectedValue(fkError);

    const res = await request(app).delete(`/api/users/${sampleUser.id}`);

    expect(res.status).toBe(409);
  });
});
