import { query } from "../../config/db.js";
import type { CreateHoldInput, Hold, UpdateHoldStatusInput } from "./hold.js";

const HOLD_COLUMNS = "hold_id, user_id, book_id, placed_at, status, ready_expires_at, queue_position";

type HoldRow = {
    hold_id: string;
    user_id: string;
    book_id: string;
    placed_at: string | Date;
    status: string;
    ready_expires_at: string | Date | null;
    queue_position: number;
};

function mapHoldRow(row: HoldRow): Hold {
    return {
        id: row.hold_id,
        userId: row.user_id,
        bookId: row.book_id,
        placedAt: row.placed_at instanceof Date
            ? row.placed_at.toISOString()
            : row.placed_at,
        status: row.status as Hold["status"],
        readyExpiresAt: row.ready_expires_at instanceof Date
            ? row.ready_expires_at.toISOString()
            : row.ready_expires_at,
        queuePosition: row.queue_position,
    };
}

// Creates a new hold for a user on a book. Queue position is assigned as the
// next position among active/ready holds for that book.
export async function createHold(input: CreateHoldInput): Promise<Hold> {
    const res = await query<HoldRow>(
        `INSERT INTO holds (user_id, book_id, placed_at, status, queue_position)
         VALUES ($1, $2, NOW(), 'ACTIVE', (
             SELECT COUNT(*) + 1
             FROM holds
             WHERE book_id = $2
               AND status IN ('ACTIVE', 'READY')
         ))
         RETURNING ${HOLD_COLUMNS}`,
        [input.userId, input.bookId]
    );

    return mapHoldRow(res.rows[0]);
}

// Returns active and ready holds for a book in queue order.
export async function getHoldsByBookId(bookId: string): Promise<Hold[]> {
    const res = await query<HoldRow>(
        `SELECT ${HOLD_COLUMNS}
         FROM holds
         WHERE book_id = $1
           AND status IN ('ACTIVE', 'READY')
         ORDER BY queue_position`,
        [bookId]
    );

    return res.rows.map(mapHoldRow);
}

// Returns an existing ACTIVE or READY hold for a user on a specific book, or
// null if the user is not currently in the queue for that book.
export async function getUserActiveHoldForBook(
    userId: string,
    bookId: string
): Promise<Hold | null> {
    const res = await query<HoldRow>(
        `SELECT ${HOLD_COLUMNS}
         FROM holds
         WHERE user_id = $1
           AND book_id = $2
           AND status IN ('ACTIVE', 'READY')
         LIMIT 1`,
        [userId, bookId]
    );

    if (res.rows.length === 0) return null;
    return mapHoldRow(res.rows[0]);
}

// Returns all holds for a user across all books.
export async function getHoldsByUserId(userId: string): Promise<Hold[]> {
    const res = await query<HoldRow>(
        `SELECT ${HOLD_COLUMNS}
         FROM holds
         WHERE user_id = $1
         ORDER BY placed_at DESC`,
        [userId]
    );

    return res.rows.map(mapHoldRow);
}

// Returns a hold by id, or null if not found.
export async function getHoldById(holdId: string): Promise<Hold | null> {
    const res = await query<HoldRow>(
        `SELECT ${HOLD_COLUMNS}
         FROM holds
         WHERE hold_id = $1`,
        [holdId]
    );

    if (res.rows.length === 0) return null;
    return mapHoldRow(res.rows[0]);
}

// Returns the 1-based queue position of a hold within the active/ready holds
// for its book. Returns null if the hold is not found or not in the queue.
export async function getHoldQueuePosition(
    holdId: string,
    bookId: string
): Promise<number | null> {
    const res = await query<{ position: string }>(
        `SELECT COUNT(*) + 1 AS position
         FROM holds
         WHERE book_id = $1
           AND status IN ('ACTIVE', 'READY')
           AND queue_position < (
               SELECT queue_position
               FROM holds
               WHERE hold_id = $2
           )`,
        [bookId, holdId]
    );

    if (res.rows.length === 0) return null;
    return Number(res.rows[0].position);
}

// Updates the status (and optionally ready_expires_at) of a hold.
export async function updateHoldStatus(
    holdId: string,
    input: UpdateHoldStatusInput
): Promise<Hold | null> {
    const res = await query<HoldRow>(
        `UPDATE holds
         SET status = $1, ready_expires_at = $2
         WHERE hold_id = $3
         RETURNING ${HOLD_COLUMNS}`,
        [input.status, input.readyExpiresAt ?? null, holdId]
    );

    if (res.rows.length === 0) return null;
    return mapHoldRow(res.rows[0]);
}

// Reassigns queue_position 1..N for the given holds in the order provided.
// Only updates holds that are ACTIVE or READY for the given book.
export async function reorderQueue(
    bookId: string,
    holdIds: string[]
): Promise<Hold[]> {
    const res = await query<HoldRow>(
        `UPDATE holds
         SET queue_position = ord.position::integer
         FROM UNNEST($1::uuid[]) WITH ORDINALITY AS ord(ord_hold_id, position)
         WHERE holds.hold_id = ord.ord_hold_id
           AND holds.book_id = $2
           AND holds.status IN ('ACTIVE', 'READY')
         RETURNING ${HOLD_COLUMNS}`,
        [holdIds, bookId]
    );

    return res.rows.map(mapHoldRow).sort((a, b) => a.queuePosition - b.queuePosition);
}
