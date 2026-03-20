import bcrypt from "bcryptjs";
import { query } from "../../config/db.js";
import type { User, UserRole, UserStatus } from "./user.js";

export type CreateUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
};

export type UpdateUserInput = {
  email?: string;
  firstName?: string;
  lastName?: string;
};

type UserRow = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string | Date;
};

function mapUserRow(row: UserRow): User {
  return {
    id: row.user_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    status: row.status,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : row.created_at,
  };
}

const USER_COLUMNS = `user_id, email, first_name, last_name, role, status, created_at`;

// Gets a single user by their UUID.
export async function getUserById(userId: string): Promise<User | null> {
  const res = await query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE user_id = $1`,
    [userId]
  );

  if (res.rows.length === 0) return null;
  return mapUserRow(res.rows[0]);
}

// Creates a new user (staff-initiated). Defaults role to PATRON if not provided.
export async function createStaffUser(input: CreateUserInput): Promise<User> {
  const passwordHash = await bcrypt.hash(input.password, 10);

  const res = await query<UserRow>(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, status, created_at)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW())
     RETURNING ${USER_COLUMNS}`,
    [
      input.email,
      passwordHash,
      input.firstName,
      input.lastName,
      input.role ?? 'PATRON',
    ]
  );

  return mapUserRow(res.rows[0]);
}

// Updates user profile fields that were provided and returns the updated user.
export async function updateUser(userId: string, input: UpdateUserInput): Promise<User | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.email !== undefined) { fields.push(`email = $${paramIndex++}`); values.push(input.email); }
  if (input.firstName !== undefined) { fields.push(`first_name = $${paramIndex++}`); values.push(input.firstName); }
  if (input.lastName !== undefined) { fields.push(`last_name = $${paramIndex++}`); values.push(input.lastName); }

  if (fields.length === 0) return null;

  values.push(userId);

  const res = await query<UserRow>(
    `UPDATE users SET ${fields.join(", ")} WHERE user_id = $${paramIndex} RETURNING ${USER_COLUMNS}`,
    values
  );

  if (res.rows.length === 0) return null;
  return mapUserRow(res.rows[0]);
}

// Updates only the status of a user and returns the updated user.
export async function updateUserStatus(userId: string, status: UserStatus): Promise<User | null> {
  const res = await query<UserRow>(
    `UPDATE users SET status = $1 WHERE user_id = $2 RETURNING ${USER_COLUMNS}`,
    [status, userId]
  );

  if (res.rows.length === 0) return null;
  return mapUserRow(res.rows[0]);
}

// Deletes a user by UUID and returns true if a row was removed.
export async function deleteUser(userId: string): Promise<boolean> {
  const res = await query<{ user_id: string }>(
    `DELETE FROM users WHERE user_id = $1 RETURNING user_id`,
    [userId]
  );

  return res.rows.length > 0;
}
