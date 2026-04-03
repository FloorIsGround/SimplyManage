import { query } from "../../config/db.js";
import type { Book } from "./book.js";

export type UpdateBookInput = {
  isbn?: string;
  title?: string;
  author?: string;
  audience?: string;
  genre?: string | null;
  description?: string | null;
  publicationYear?: number | null;
};

export type CreateBookInput = {
  isbn: string;
  title: string;
  author: string;
  audience: string;
  genre?: string | null;
  description?: string | null;
  publicationYear?: number | null;
};

// Matches the raw book row shape coming back from PostgreSQL.
type BookRow = {
  book_id: string;
  isbn: string;
  title: string;
  author: string;
  genre: string | null;
  description: string | null;
  publication_year: number | null;
  created_at: string | Date;
  average_rating: number | null;
  audience: string | null;
};

// Converts a database row into the Book model shape (without reviews).
function mapBookRow(row: BookRow): Book {
  return {
    id: row.book_id,
    isbn: row.isbn ? Number(row.isbn) : 0,
    title: row.title,
    author: row.author,
    genre: row.genre,
    description: row.description,
    publicationYear: row.publication_year,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : row.created_at,
    averageRating: row.average_rating != null ? Number(row.average_rating) : 0,
    audience: row.audience ?? "",
  };
}

const BOOK_COLUMNS = `book_id, isbn, title, author, genre, description, publication_year, created_at, average_rating, audience`;

// Gets all books.
export async function getAllBooks(): Promise<Book[]> {
  const res = await query<BookRow>(
    `SELECT ${BOOK_COLUMNS} FROM books ORDER BY title`
  );

  return res.rows.map(mapBookRow);
}

// Searches books by title, author, or genre.
export async function searchBooksByQuery(searchQuery: string): Promise<Book[]> {
  const res = await query<BookRow>(
    `SELECT ${BOOK_COLUMNS} FROM books
     WHERE LOWER(title) LIKE LOWER($1)
        OR LOWER(author) LIKE LOWER($1)
        OR LOWER(genre) LIKE LOWER($1)`,
    [`%${searchQuery}%`]
  );

  return res.rows.map(mapBookRow);
}

// Gets a single book by its UUID.
export async function getBookById(bookId: string): Promise<Book | null> {
  const res = await query<BookRow>(
    `SELECT ${BOOK_COLUMNS} FROM books WHERE book_id = $1`,
    [bookId]
  );

  if (res.rows.length === 0) return null;
  return mapBookRow(res.rows[0]);
}

// Gets a single book by its ISBN.
// Takes isbn as a number
// The db returns isbn as a string
export async function getBookByIsbn(isbn: number): Promise<Book | null> {
  const res = await query<BookRow>(
    `SELECT ${BOOK_COLUMNS} FROM books WHERE isbn = $1`,
    [isbn]
  );

  if (res.rows.length === 0) return null;
  return mapBookRow(res.rows[0]);
}

// Creates a new book and returns the inserted row.
export async function createBook(input: CreateBookInput): Promise<Book> {
  const res = await query<BookRow>(
    `INSERT INTO books (isbn, title, author, audience, genre, description, publication_year)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${BOOK_COLUMNS}`,
    [
      input.isbn,
      input.title,
      input.author,
      input.audience,
      input.genre ?? null,
      input.description ?? null,
      input.publicationYear ?? null,
    ]
  );

  return mapBookRow(res.rows[0]);
}

// Updates the book fields that were provided and returns the updated book.
export async function updateBook(bookId: string, input: UpdateBookInput): Promise<Book | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.isbn !== undefined) { fields.push(`isbn = $${paramIndex++}`); values.push(input.isbn); }
  if (input.title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(input.title); }
  if (input.author !== undefined) { fields.push(`author = $${paramIndex++}`); values.push(input.author); }
  if (input.audience !== undefined) { fields.push(`audience = $${paramIndex++}`); values.push(input.audience); }
  if (input.genre !== undefined) { fields.push(`genre = $${paramIndex++}`); values.push(input.genre); }
  if (input.description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(input.description); }
  if (input.publicationYear !== undefined) { fields.push(`publication_year = $${paramIndex++}`); values.push(input.publicationYear); }

  if (fields.length === 0) return null;

  values.push(bookId);

  const res = await query<BookRow>(
    `UPDATE books SET ${fields.join(", ")} WHERE book_id = $${paramIndex} RETURNING ${BOOK_COLUMNS}`,
    values
  );

  if (res.rows.length === 0) return null;
  return mapBookRow(res.rows[0]);
}

// Deletes a book by UUID and returns true if a row was removed.
export async function deleteBook(bookId: string): Promise<boolean> {
  const res = await query<{ book_id: string }>(
    `DELETE FROM books WHERE book_id = $1 RETURNING book_id`,
    [bookId]
  );

  return res.rows.length > 0;
}
