import { query, withTransaction } from "../../config/db.js";
import type { CreateFeeInput, CreateReceiptForFeesInput, Fee, FeeStatus, Receipt } from "./billing.js";

const FEE_COLUMNS = "f.fee_id, f.user_id, f.loan_id, f.amount_cents, f.reason, f.status, f.assessed_at";
const RECEIPT_COLUMNS = "receipt_id, user_id, amount_cents, external_receipt_id, external_transaction_id, payment_method, note, paid_at, created_at";

type FeeRow = {
    fee_id: string;
    user_id: string;
    loan_id: string | null;
    amount_cents: number;
    reason: Fee["reason"];
    status: FeeStatus;
    assessed_at: string | Date;
    book_title?: string | null;
};

type ReceiptRow = {
    receipt_id: string;
    user_id: string;
    amount_cents: number;
    external_receipt_id: string;
    external_transaction_id: string | null;
    payment_method: Receipt["paymentMethod"];
    note: string | null;
    paid_at: string | Date;
    created_at: string | Date;
};

function toIsoString(value: string | Date): string {
    return value instanceof Date ? value.toISOString() : value;
}

function mapFeeRow(row: FeeRow): Fee {
    return {
        id: row.fee_id,
        userId: row.user_id,
        loanId: row.loan_id,
        amountCents: row.amount_cents,
        reason: row.reason,
        status: row.status,
        assessedAt: toIsoString(row.assessed_at),
        ...(row.book_title ? { bookTitle: row.book_title } : {}),
    };
}

function mapReceiptRow(row: ReceiptRow): Receipt {
    return {
        id: row.receipt_id,
        userId: row.user_id,
        amountCents: row.amount_cents,
        externalReceiptId: row.external_receipt_id,
        externalTransactionId: row.external_transaction_id,
        paymentMethod: row.payment_method,
        note: row.note,
        paidAt: toIsoString(row.paid_at),
        createdAt: toIsoString(row.created_at),
    };
}

export async function createFee(input: CreateFeeInput): Promise<Fee> {
    const res = await query<FeeRow>(
        `INSERT INTO fees (user_id, loan_id, amount_cents, reason, status, assessed_at)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, NOW()))
         RETURNING fee_id, user_id, loan_id, amount_cents, reason, status, assessed_at`,
        [
            input.userId,
            input.loanId ?? null,
            input.amountCents,
            input.reason,
            input.status ?? "ASSESSED",
            input.assessedAt ?? null,
        ]
    );

    return mapFeeRow(res.rows[0]);
}

export async function createOverdueFee(input: Omit<CreateFeeInput, "reason" | "status">): Promise<Fee | null> {
    const res = await query<FeeRow>(
        `INSERT INTO fees (user_id, loan_id, amount_cents, reason, status, assessed_at)
         VALUES ($1, $2, $3, 'OVERDUE', 'ASSESSED', COALESCE($4::timestamptz, NOW()))
         ON CONFLICT (loan_id) WHERE reason = 'OVERDUE' DO NOTHING
         RETURNING fee_id, user_id, loan_id, amount_cents, reason, status, assessed_at`,
        [input.userId, input.loanId ?? null, input.amountCents, input.assessedAt ?? null]
    );

    if (res.rows.length === 0) return null;
    return mapFeeRow(res.rows[0]);
}

export async function getFeesByUserId(userId: string, status?: FeeStatus): Promise<Fee[]> {
    const params: unknown[] = [userId];
    let statusFilter = "";

    if (status) {
        params.push(status);
        statusFilter = " AND f.status = $2";
    }

    const res = await query<FeeRow>(
        `SELECT ${FEE_COLUMNS}, b.title AS book_title
         FROM fees f
         LEFT JOIN loans l ON f.loan_id = l.loan_id
         LEFT JOIN copies c ON l.copy_id = c.copy_id
         LEFT JOIN books b ON c.book_id = b.book_id
         WHERE f.user_id = $1${statusFilter}
         ORDER BY f.assessed_at DESC`,
        params
    );

    return res.rows.map(mapFeeRow);
}

export async function getOutstandingFeesByUserId(userId: string): Promise<Fee[]> {
    return getFeesByUserId(userId, "ASSESSED");
}

export async function getAssessedFeesByIdsForUser(userId: string, feeIds: string[]): Promise<Fee[]> {
    if (feeIds.length === 0) return [];

    const res = await query<FeeRow>(
        `SELECT ${FEE_COLUMNS}, b.title AS book_title
         FROM fees f
         LEFT JOIN loans l ON f.loan_id = l.loan_id
         LEFT JOIN copies c ON l.copy_id = c.copy_id
         LEFT JOIN books b ON c.book_id = b.book_id
         WHERE f.user_id = $1
           AND f.status = 'ASSESSED'
           AND f.fee_id = ANY($2::uuid[])
         ORDER BY f.assessed_at ASC`,
        [userId, feeIds]
    );

    return res.rows.map(mapFeeRow);
}

export async function getReceiptById(receiptId: string): Promise<Receipt | null> {
    const res = await query<ReceiptRow>(
        `SELECT ${RECEIPT_COLUMNS}
         FROM receipts
         WHERE receipt_id = $1`,
        [receiptId]
    );

    if (res.rows.length === 0) return null;
    return mapReceiptRow(res.rows[0]);
}

export async function createReceiptForFees(input: CreateReceiptForFeesInput): Promise<Receipt> {
    if (input.fees.length === 0) {
        throw new Error("createReceiptForFees requires at least one fee.");
    }

    return withTransaction(async (client) => {
        const receiptRes = await client.query<ReceiptRow>(
            `INSERT INTO receipts (
                user_id,
                amount_cents,
                external_receipt_id,
                external_transaction_id,
                payment_method,
                note,
                paid_at
             )
             VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamptz, NOW()))
             RETURNING ${RECEIPT_COLUMNS}`,
            [
                input.userId,
                input.amountCents,
                input.externalReceiptId,
                input.externalTransactionId ?? null,
                input.paymentMethod ?? "MANUAL",
                input.note ?? null,
                input.paidAt ?? null,
            ]
        );

        const receipt = mapReceiptRow(receiptRes.rows[0]);

        for (const fee of input.fees) {
            await client.query(
                `INSERT INTO receipt_fees (receipt_id, fee_id, amount_cents)
                 VALUES ($1, $2, $3)`,
                [receipt.id, fee.feeId, fee.amountCents]
            );
        }

        await client.query(
            `UPDATE fees
             SET status = 'PAID'
             WHERE user_id = $1
               AND status = 'ASSESSED'
               AND fee_id = ANY($2::uuid[])`,
            [input.userId, input.fees.map((fee) => fee.feeId)]
        );

        return receipt;
    });
}
