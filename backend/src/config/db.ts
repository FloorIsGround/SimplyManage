// Search books by title, author, or genre
export async function searchBooks(query: string): Promise<Book[]> {
  const res = await pool.query(
    `SELECT * FROM books WHERE 
      LOWER(title) LIKE LOWER($1) OR 
      LOWER(author) LIKE LOWER($1) OR 
      LOWER(genre) LIKE LOWER($1)`,
    [`%${query}%`]
  );
  const books = await Promise.all(res.rows.map(async (row: any) => {
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
  return books;
}
import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { Faq } from "../models/libraryInfo/faqs.js";
import { Book } from "../models/libraryInfo/book.js";
export async function getBooks(): Promise<Book[]> {
  const res = await pool.query("SELECT * FROM books");
  const books = await Promise.all(res.rows.map(async (row: any) => {
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
  return books;
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
