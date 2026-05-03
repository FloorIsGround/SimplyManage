import bcrypt from "bcryptjs";
import { query } from "../../config/db.js";
import type { User, UserRole, UserStatus } from "./user.js";

export type CreateUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  libraryCardNumber?: string;
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
  library_card_number: string;
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
    libraryCardNumber: row.library_card_number,
    role: row.role,
    status: row.status,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : row.created_at,
  };
}

const USER_COLUMNS = `user_id, email, first_name, last_name, library_card_number, role, status, created_at`;

// Gets a single user by their UUID.
export async function getUserById(userId: string): Promise<User | null> {
  const res = await query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE user_id = $1`,
    [userId]
  );

  if (res.rows.length === 0) return null;
  return mapUserRow(res.rows[0]);
}

// Gets all users, optionally filtered by role and/or card number
export async function getUsersByFilter({ role, cardNumber }: { role?: string, cardNumber?: string }): Promise<User[]> {
  let sql = `SELECT ${USER_COLUMNS} FROM users`;
  const params: any[] = [];
  const conditions: string[] = [];
  if (role) {
    conditions.push(`LOWER(role) = LOWER($${params.length + 1})`);
    params.push(role);
  }
  if (cardNumber) {
    conditions.push(`library_card_number = $${params.length + 1}`);
    params.push(cardNumber);
  }
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ` ORDER BY last_name, first_name`;
  const res = await query<UserRow>(sql, params);
  return res.rows.map(mapUserRow);
}

// Get user by email for login
export async function getUserByEmail(email: string): Promise<any | null> {
  const res = await query(
    `SELECT user_id, email, password_hash, role, status FROM users WHERE email = $1`,
    [email]
  );
  return res.rows[0] || null;
}

// Creates a new user (staff-initiated). Defaults role to PATRON if not provided.
export async function createStaffUser(input: CreateUserInput): Promise<User> {
  const passwordHash = await bcrypt.hash(input.password, 10);

  // Generate a unique library card number if not provided
  let libraryCardNumber = input.libraryCardNumber;
  if (!libraryCardNumber) {
    libraryCardNumber = await generateUniqueLibraryCardNumber();
  }

  const res = await query<UserRow>(
    `INSERT INTO users (email, password_hash, first_name, last_name, library_card_number, role, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', NOW())
     RETURNING ${USER_COLUMNS}`,
    [
      input.email,
      passwordHash,
      input.firstName,
      input.lastName,
      libraryCardNumber,
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

// Checks a plain-text password against the stored hash for a user. Returns false if the user doesn't exist.
export async function verifyUserPassword(userId: string, password: string): Promise<boolean> {
  const res = await query<{ password_hash: string }>(
    `SELECT password_hash FROM users WHERE user_id = $1`,
    [userId]
  );

  if (res.rows.length === 0) return false;
  return bcrypt.compare(password, res.rows[0].password_hash);
}

// Updates the password_hash for a user and returns true if a row was updated.
export async function updateUserPassword(userId: string, password: string): Promise<boolean> {
  const passwordHash = await bcrypt.hash(password, 10);

  const res = await query<{ user_id: string }>(
    `UPDATE users SET password_hash = $1 WHERE user_id = $2 RETURNING user_id`,
    [passwordHash, userId]
  );

  return res.rows.length > 0;
}

// Deletes a user by UUID and returns true if a row was removed.
export async function deleteUser(userId: string): Promise<boolean> {
  const res = await query<{ user_id: string }>(
    `DELETE FROM users WHERE user_id = $1 RETURNING user_id`,
    [userId]
  );

  return res.rows.length > 0;
}

// Generates a unique random 8-digit library card number not already used by any user.
async function generateUniqueLibraryCardNumber(): Promise<string> {
  let cardNumber: string;
  let exists = true;
  while (exists) {
    cardNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
    const res = await query('SELECT 1 FROM users WHERE library_card_number = $1', [cardNumber]);
    exists = res.rows.length > 0;
  }
  return cardNumber!;
}
