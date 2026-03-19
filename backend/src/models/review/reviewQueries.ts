import { query } from "../../config/db.js";
import type { CreateReviewInput, Review, UpdateReviewInput } from "./review.js";

// Matches the raw review row shape coming back from PostgreSQL.
type ReviewRow = {
  id: number;
  user_id: string;
  book_id: string;
  rating: number;
  comment: string | null;
  created_at: string | Date;
};

// Converts a database row into the frontend/backend review model shape.
function mapReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    userId: row.user_id,
    bookId: row.book_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : row.created_at,
  };
}

// Gets all reviews for one specific book.
export async function getReviewsByBookId(bookId: string): Promise<Review[]> {
  const res = await query<ReviewRow>(
    `SELECT id, user_id, book_id, rating, comment, created_at
     FROM reviews
     WHERE book_id = $1
     ORDER BY created_at DESC`,
    [bookId]
  );

  return res.rows.map(mapReviewRow);
}

// Creates a new review and returns the inserted row.
export async function createReview(input: CreateReviewInput): Promise<Review> {
  const res = await query<ReviewRow>(
    `INSERT INTO reviews (user_id, book_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, book_id, rating, comment, created_at`,
    [input.userId, input.bookId, input.rating, input.comment ?? null]
  );

  return mapReviewRow(res.rows[0]);
}

// Updates the review fields that were provided and returns the updated review.
export async function updateReview(
  id: number,
  input: UpdateReviewInput
): Promise<Review | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  // Only update rating if it was included.
  if (input.rating !== undefined) {
    fields.push(`rating = $${paramIndex++}`);
    values.push(input.rating);
  }

  // Only update comment if it was included.
  if (input.comment !== undefined) {
    fields.push(`comment = $${paramIndex++}`);
    values.push(input.comment);
  }

  // If nothing was passed in, there is nothing to update.
  if (fields.length === 0) {
    return null;
  }

  values.push(id);

  const res = await query<ReviewRow>(
    `UPDATE reviews
     SET ${fields.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING id, user_id, book_id, rating, comment, created_at`,
    values
  );

  // Return null if no matching review was found.
  if (res.rows.length === 0) {
    return null;
  }

  return mapReviewRow(res.rows[0]);
}

// Deletes a review by id and returns true if a row was removed.
export async function deleteReview(id: number): Promise<boolean> {
  const res = await query<{ id: number }>(
    `DELETE FROM reviews
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  return res.rows.length > 0;
}