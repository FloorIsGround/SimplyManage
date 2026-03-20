import { query } from "../../config/db.js";
import type { Book } from "./book.js";

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
