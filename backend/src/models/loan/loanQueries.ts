import { query } from "../../config/db.js";
import type { CreateLoanInput, Loan } from "./loan.js";

const LOAN_COLUMNS = "loan_id, user_id, copy_id, checkout_at, due_at, returned_at, renewal_count";

type LoanRow = {
    loan_id: string;
    user_id: string;
    copy_id: string;
    checkout_at: string | Date;
    due_at: string | Date;
    returned_at: string | Date | null;
    renewal_count: number;
};

function mapLoanRow(row: LoanRow): Loan {
    return {
        id: row.loan_id,
        userId: row.user_id,
        copyId: row.copy_id,
        checkoutAt: row.checkout_at instanceof Date
            ? row.checkout_at.toISOString()
            : row.checkout_at,
        dueAt: row.due_at instanceof Date
            ? row.due_at.toISOString()
            : row.due_at,
        returnedAt: row.returned_at instanceof Date
            ? row.returned_at.toISOString()
            : row.returned_at,
        renewalCount: row.renewal_count,
    };
}

// Creates a new loan for a user checking out a copy.
export async function createLoan(input: CreateLoanInput): Promise<Loan> {
    const res = await query<LoanRow>(
        `INSERT INTO loans (user_id, copy_id, checkout_at, due_at)
         VALUES ($1, $2, NOW(), $3)
         RETURNING ${LOAN_COLUMNS}`,
        [input.userId, input.copyId, input.dueAt]
    );

    return mapLoanRow(res.rows[0]);
}

// Returns a loan by id, or null if not found.
export async function getLoanById(loanId: string): Promise<Loan | null> {
    const res = await query<LoanRow>(
        `SELECT ${LOAN_COLUMNS}
         FROM loans
         WHERE loan_id = $1`,
        [loanId]
    );

    if (res.rows.length === 0) return null;
    return mapLoanRow(res.rows[0]);
}

// Returns all loans for a user, most recent first.
export async function getLoansByUserId(userId: string): Promise<Loan[]> {
    const res = await query<LoanRow>(
        `SELECT ${LOAN_COLUMNS}
         FROM loans
         WHERE user_id = $1
         ORDER BY checkout_at DESC`,
        [userId]
    );

    return res.rows.map(mapLoanRow);
}

// Returns all loans for a specific copy, most recent first.
export async function getLoansByCopyId(copyId: string): Promise<Loan[]> {
    const res = await query<LoanRow>(
        `SELECT ${LOAN_COLUMNS}
         FROM loans
         WHERE copy_id = $1
         ORDER BY checkout_at DESC`,
        [copyId]
    );

    return res.rows.map(mapLoanRow);
}

// Marks a loan as returned by setting returned_at to now.
export async function returnLoan(loanId: string): Promise<Loan | null> {
    const res = await query<LoanRow>(
        `UPDATE loans
         SET returned_at = NOW()
         WHERE loan_id = $1
           AND returned_at IS NULL
         RETURNING ${LOAN_COLUMNS}`,
        [loanId]
    );

    if (res.rows.length === 0) return null;
    return mapLoanRow(res.rows[0]);
}

// Extends the due date of a loan and increments renewal_count.
export async function renewLoan(loanId: string, dueAt: string): Promise<Loan | null> {
    const res = await query<LoanRow>(
        `UPDATE loans
         SET due_at = $1, renewal_count = renewal_count + 1
         WHERE loan_id = $2
           AND returned_at IS NULL
         RETURNING ${LOAN_COLUMNS}`,
        [dueAt, loanId]
    );

    if (res.rows.length === 0) return null;
    return mapLoanRow(res.rows[0]);
}
