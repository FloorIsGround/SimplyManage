import { query } from "../../config/db.js";
import type { Copy, ConditionStatus } from "./copy.js";

export type CreateCopiesInput = {
  bookId: string;
  quantity: number;
  conditionStatus: ConditionStatus;
  location?: string | null;
};

export type UpdateCopyStatusInput = {
  conditionStatus: ConditionStatus;
};

type CopyRow = {
  copy_id: string;
  book_id: string;
  barcode: string | null;
  condition_status: ConditionStatus;
  location: string | null;
  created_at: string | Date;
};

function mapCopyRow(row: CopyRow): Copy {
  return {
    id: row.copy_id,
    bookId: row.book_id,
    barcode: row.barcode,
    conditionStatus: row.condition_status,
    location: row.location,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : row.created_at,
  };
}

const COPY_COLUMNS = `copy_id, book_id, barcode, condition_status, location, created_at`;

// Gets all copies for a given book.
export async function getCopiesByBookId(bookId: string): Promise<Copy[]> {
  const res = await query<CopyRow>(
    `SELECT ${COPY_COLUMNS} FROM copies WHERE book_id = $1 ORDER BY created_at`,
    [bookId]
  );

  return res.rows.map(mapCopyRow);
}

// Gets a single copy by its barcode.
export async function getCopyByBarcode(barcode: string): Promise<Copy | null> {
  const res = await query<CopyRow>(
    `SELECT ${COPY_COLUMNS} FROM copies WHERE barcode = $1`,
    [barcode]
  );

  if (res.rows.length === 0) return null;
  return mapCopyRow(res.rows[0]);
}

// Inserts N copies for a book and returns all inserted rows.
export async function createCopies(input: CreateCopiesInput): Promise<Copy[]> {
  const rows: Copy[] = [];

  for (let i = 0; i < input.quantity; i++) {
    const res = await query<CopyRow>(
      `INSERT INTO copies (book_id, condition_status, location)
       VALUES ($1, $2, $3)
       RETURNING ${COPY_COLUMNS}`,
      [input.bookId, input.conditionStatus, input.location ?? null]
    );
    rows.push(mapCopyRow(res.rows[0]));
  }

  return rows;
}

// Updates the condition_status of a copy by barcode and returns the updated copy.
export async function updateCopyStatus(barcode: string, input: UpdateCopyStatusInput): Promise<Copy | null> {
  const res = await query<CopyRow>(
    `UPDATE copies SET condition_status = $1 WHERE barcode = $2 RETURNING ${COPY_COLUMNS}`,
    [input.conditionStatus, barcode]
  );

  if (res.rows.length === 0) return null;
  return mapCopyRow(res.rows[0]);
}
