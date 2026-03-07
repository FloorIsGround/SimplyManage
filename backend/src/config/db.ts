import bcrypt from "bcryptjs";

// Create user for signup
export async function createUser({ email, password, firstName, lastName }: { email: string; password: string; firstName: string; lastName: string }): Promise<any> {
  const hashedPassword = await bcrypt.hash(password, 10);
  const res = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, status, created_at)
     VALUES ($1, $2, $3, $4, 'PATRON', 'ACTIVE', NOW()) RETURNING user_id, email, first_name, last_name, role, status`,
    [email, hashedPassword, firstName, lastName]
  );
  return res.rows[0];
}
// Get libraries with hours for /hourslocations endpoint
export async function getHoursLocations(): Promise<any[]> {
  // Join libraries and hours in one query
  const res = await pool.query(`
    SELECT l.id, l.name, l.address, l.phone_number,
           h.day, h.open, h.close
    FROM library l
    LEFT JOIN library_hours h ON l.id = h.library_id
    ORDER BY l.id, h.id
  `);

  // Group results by library
  const librariesMap: { [key: number]: any } = {};
  for (const row of res.rows) {
    if (!librariesMap[row.id]) {
      librariesMap[row.id] = {
        id: row.id,
        name: row.name,
        address: row.address,
        phoneNumber: row.phone_number,
        hours: []
      };
    }
    if (row.day) {
      librariesMap[row.id].hours.push({
        day: row.day,
        open: row.open,
        close: row.close
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
  return await Promise.all(res.rows.map(async (row: any) => {
    const reviewsRes = await pool.query(
      'SELECT * FROM reviews WHERE book_id = $1',
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
      audience: row.audience ?? '',
      reviews: reviewsRes.rows.map((review: any) => ({
        id: review.id,
        userId: review.user_id,
        bookId: review.book_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
      })),
    };
  }));
}
import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { Book } from "../models/book/book.js";
import { Faq } from "../models/libraryInfo/faqs.js";

export async function getBooks(): Promise<Book[]> {
  const res = await pool.query("SELECT * FROM books");
  return await Promise.all(res.rows.map(async (row: any) => {
    const reviewsRes = await pool.query(
      'SELECT * FROM reviews WHERE book_id = $1',
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
      audience: row.audience ?? '',
      reviews: reviewsRes.rows.map((review: any) => ({
        id: review.id,
        userId: review.user_id,
        bookId: review.book_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
      })),
    };
  }));
}

// Use a global pool to prevent creating a new pool on every reload (dev).
type GlobalWithPool = typeof globalThis & { pgPool?: Pool };

// look to .env for DB_SSL setting
const sslEnabled = String(process.env.DB_SSL || "").toLowerCase() === "true";

const g = globalThis as GlobalWithPool;

//create pool once
if (!g.pgPool) {
  g.pgPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD ?? ""),
    database: process.env.DB_NAME,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false // enable only if DB supports SSL
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
