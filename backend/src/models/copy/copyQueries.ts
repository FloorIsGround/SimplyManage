import { query } from "../../config/db.js";
import type { Copy, ConditionStatus } from "./copy.js";

export type CreateCopiesInput = {
  bookId: string;
  quantity: number;
  conditionStatus: ConditionStatus;
  branchId: number;
};

export type UpdateCopyStatusInput = {
  conditionStatus: ConditionStatus;
};

type CopyRow = {
  copy_id: string;
  book_id: string;
  barcode: string | null;
  condition_status: ConditionStatus;
  branch_id: number;
  created_at: string | Date;
};

function mapCopyRow(row: CopyRow): Copy {
  return {
    id: row.copy_id,
    bookId: row.book_id,
    barcode: row.barcode,
    conditionStatus: row.condition_status,
    branchId: row.branch_id,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : row.created_at,
  };
}

const COPY_COLUMNS = `copy_id, book_id, barcode, condition_status, branch_id, created_at`;

// Gets a single copy by its UUID.
export async function getCopyById(copyId: string): Promise<Copy | null> {
  const res = await query<CopyRow>(
    `SELECT ${COPY_COLUMNS} FROM copies WHERE copy_id = $1`,
    [copyId]
  );

  if (res.rows.length === 0) return null;
  return mapCopyRow(res.rows[0]);
}

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
  const branchCode = input.branchId.toString().padStart(2, '0');
  const year = new Date().getFullYear().toString().slice(-2);

  try {
    // Find the current max sequence for this branch/year
    const seqRes = await query(
      `SELECT barcode FROM copies WHERE barcode LIKE $1 ORDER BY barcode DESC LIMIT 1`,
      [`${branchCode}${year}%`]
    );
    let nextSeq = 1;
    if (seqRes.rows.length > 0) {
      const lastBarcode = seqRes.rows[0].barcode;
      const lastSeq = parseInt(lastBarcode.slice(4), 10);
      nextSeq = lastSeq + 1;
    }

    for (let i = 0; i < input.quantity; i++) {
      const seqStr = (nextSeq + i).toString().padStart(4, '0');
      const barcode = `${branchCode}${year}${seqStr}`;


      const res = await query<CopyRow>(
        `INSERT INTO copies (book_id, condition_status, branch_id, barcode)
         VALUES ($1, $2, $3, $4)
         RETURNING ${COPY_COLUMNS}`,
        [input.bookId, input.conditionStatus, input.branchId, barcode]
      );
      rows.push(mapCopyRow(res.rows[0]));
    }
    return rows;
  } catch (err) {
    console.error('Error in createCopies:', err);
    throw err;
  }
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
