import bcrypt from "bcryptjs";
import { Pool, type QueryResult, type QueryResultRow } from "pg";
import type { Book, Review } from "../models/book/book.ts";
import { Faq } from "../models/libraryInfo/faqs.js";

// Event interface for type safety
export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
}

// Get events for /events endpoint
export async function getEvents(): Promise<Event[]> {
  const res = await pool.query(
    "SELECT id, title, description, date, location, start_time AS startTime, end_time AS endTime FROM events ORDER BY date, start_time"
  );

  return res.rows.map((event: any) => ({
    ...event,
    date:
      event.date instanceof Date
        ? event.date.toISOString().split("T")[0]
        : event.date,
    startTime: event.startTime,
    endTime: event.endTime,
  }));
}

// Create user for signup
export async function createUser({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<any> {
  const hashedPassword = await bcrypt.hash(password, 10);

  const res = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, status, created_at)
     VALUES ($1, $2, $3, $4, 'PATRON', 'ACTIVE', NOW())
     RETURNING user_id, email, first_name, last_name, role, status`,
    [email, hashedPassword, firstName, lastName]
  );

  return res.rows[0];
}

// Get user by email for login
export async function getUserByEmail(email: string): Promise<any | null> {
  const res = await pool.query(
    `SELECT user_id, email, password_hash, role, status FROM users WHERE email = $1`,
    [email]
  );

  return res.rows[0] || null;
}

// Get libraries with hours for /hourslocations endpoint
export async function getHoursLocations(): Promise<any[]> {
  const res = await pool.query(`
    SELECT l.id, l.name, l.address, l.phone_number,
    h.day, h.open, h.close
    FROM library l
    LEFT JOIN library_hours h ON l.id = h.library_id
    ORDER BY l.id, h.id
  `);

  const librariesMap: { [key: number]: any } = {};

  for (const row of res.rows) {
    if (!librariesMap[row.id]) {
      librariesMap[row.id] = {
        id: row.id,
        name: row.name,
        address: row.address,
        phoneNumber: row.phone_number,
        hours: [],
      };
    }

    if (row.day) {
      librariesMap[row.id].hours.push({
        day: row.day,
        open: row.open,
        close: row.close,
      });
    }
  }

  return Object.values(librariesMap);
}

// Search books by title, author, or genre
export async function searchBooks(query: string): Promise<Book[]> {
  const res = await pool.query(
    `SELECT * FROM books WHERE 
      LOWER(title) LIKE LOWER($1) OR 
      LOWER(author) LIKE LOWER($1) OR 
      LOWER(genre) LIKE LOWER($1)`,
    [`%${query}%`]
  );

  return await Promise.all(
    res.rows.map(async (row: any) => {
      const reviewsRes = await pool.query(
        `SELECT r.*, u.first_name, u.last_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.user_id
        WHERE r.book_id = $1`,
        [row.book_id]
      );

      return {
        id: row.book_id,
        isbn: row.isbn ? Number(row.isbn) : 0,
        title: row.title,
        author: row.author,
        genre: row.genre,
        description: row.description,
        publicationYear: row.publication_year,
        createdAt: row.created_at,
        averageRating: row.average_rating !== null && row.average_rating !== undefined ? Number(row.average_rating) : 0,
        audience: row.audience ?? "",
        reviews: reviewsRes.rows.map(mapReviewRow)
      };
    })
  );
}

// Map a row to a Review including the user's first and last name
function mapReviewRow(row: any): Review {
  return {
    id: row.id,
    userId: row.user_id,
    bookId: row.book_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    firstName: row.first_name ?? undefined,
    lastName: row.last_name ?? undefined,  // <-- add last name here
  };
}

// Get all books
export async function getBooks(): Promise<Book[]> {
  const res = await pool.query("SELECT * FROM books");

  return await Promise.all(
    res.rows.map(async (row: any) => {
      const reviewsRes = await pool.query(
        `SELECT r.*, u.first_name, u.last_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.user_id
        WHERE r.book_id = $1`,
        [row.book_id]
      );
      
      return {
        id: row.book_id,
        isbn: row.isbn ? Number(row.isbn) : 0,
        title: row.title,
        author: row.author,
        genre: row.genre,
        description: row.description,
        publicationYear: row.publication_year,
        createdAt: row.created_at,
        averageRating: row.average_rating !== null && row.average_rating !== undefined ? Number(row.average_rating) : 0,
        audience: row.audience ?? "",
        reviews: reviewsRes.rows.map(mapReviewRow)
      };
    })
  );
}


// Create a new review
export async function createReview({
  bookId,
  userId,
  rating,
  comment,
}: {
  bookId: string;
  userId: string;
  rating: number;
  comment: string;
}) {
  const res = await pool.query(
    `INSERT INTO reviews (book_id, user_id, rating, comment, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, book_id AS "bookId", user_id AS "userId", rating, comment, created_at AS "createdAt"`,
    [bookId, userId, rating, comment]
  );

  return res.rows[0];
}

// Use a global pool to prevent creating a new pool on every reload (dev)
type GlobalWithPool = typeof globalThis & { pgPool?: Pool };

const sslEnabled = String(process.env.DB_SSL || "").toLowerCase() === "true";

const g = globalThis as GlobalWithPool;

if (!g.pgPool) {
  g.pgPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD ?? ""),
    database: process.env.DB_NAME,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  });
}

const pool = g.pgPool!;

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function testConnection(): Promise<{ now: string }> {
  const res = await pool.query<{ now: string }>("SELECT now() AS now");
  return res.rows[0];
}

export async function getFaqs(): Promise<Faq[]> {
  const res = await pool.query<Faq>("SELECT * FROM faqs");
  return res.rows;
}