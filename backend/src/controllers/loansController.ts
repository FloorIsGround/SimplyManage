import type { NextFunction, Request, Response } from "express";
import { createHttpError, requireUuid } from "./controllerHelpers.js";
import { createLoan, getActiveLoanByCopyId, getLoanById, getLoansByCopyId, getLoansByUserId, renewLoan, returnLoan } from "../models/loan/loanQueries.js";
import { getCopyById } from "../models/copy/copyQueries.js";
import { getUserById } from "../models/user/userQueries.js";
import { getNextHoldInQueue, updateHoldStatus } from "../models/hold/holdQueries.js";
import { createOverdueFee } from "../models/billing/billingQueries.js";
import { calculateOverdueFeeCents } from "../models/billing/overdueFee.js";
import { getOverdueFeeCentsPerDay } from "../services/billing_settings.js";

// Checks out a copy to a user, creating a new loan record.
// Validates that the user is ACTIVE and the copy is AVAILABLE with no existing active loan.
export async function postLoan(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = requireUuid(req.body.userId, "userId");
        const { copyId, barcode, dueAt } = req.body;

        if (!dueAt || typeof dueAt !== "string" || isNaN(Date.parse(dueAt))) {
            throw createHttpError(400, "dueAt must be a valid ISO date string.");
        }

        const user = await getUserById(userId);
        if (!user) {
            throw createHttpError(404, "User not found.");
        }
        if (user.status !== "ACTIVE") {
            throw createHttpError(403, "User account is suspended and cannot check out items.");
        }

        let copy;
        let resolvedCopyId: string | undefined;
        if (copyId) {
            resolvedCopyId = requireUuid(copyId, "copyId");
            copy = await getCopyById(resolvedCopyId);
        } else if (barcode) {
            copy = await (typeof barcode === "string" ? import("../models/copy/copyQueries.js").then(m => m.getCopyByBarcode(barcode)) : Promise.resolve(null));
            if (copy) {
                resolvedCopyId = copy.id;
            }
        } else {
            throw createHttpError(400, "Either copyId or barcode is required.");
        }

        if (!copy || !resolvedCopyId) {
            throw createHttpError(404, "Copy not found.");
        }
        if (copy.conditionStatus !== "AVAILABLE") {
            throw createHttpError(409, `Copy is not available for checkout (status: ${copy.conditionStatus}).`);
        }

        const activeLoan = await getActiveLoanByCopyId(resolvedCopyId);
        if (activeLoan) {
            throw createHttpError(409, "Copy is already checked out.");
        }

        const loan = await createLoan({ userId, copyId: resolvedCopyId, dueAt });

        return res.status(201).json(loan);
    } catch (err) {
        next(err);
    }
}

// Marks a loan as returned, transitions the next hold in queue to READY if one exists,
// and includes a placeholder for fee generation on overdue returns.
export async function patchLoanReturn(req: Request, res: Response, next: NextFunction) {
    try {
        const loanId = requireUuid(req.params.loanId, "loanId");

        const existing = await getLoanById(loanId);
        if (!existing) {
            throw createHttpError(404, "Loan not found.");
        }
        if (existing.returnedAt !== null) {
            throw createHttpError(409, "Loan has already been returned.");
        }

        const loan = await returnLoan(loanId);
        if (!loan) {
            throw createHttpError(500, "Failed to process return.");
        }

        if (!loan.returnedAt) {
            throw createHttpError(500, "Returned loan is missing returnedAt timestamp.");
        }

        const feeCentsPerDay = getOverdueFeeCentsPerDay();
        const overdueFeeCents = calculateOverdueFeeCents(loan.dueAt, loan.returnedAt, feeCentsPerDay);

        if (overdueFeeCents > 0) {
            await createOverdueFee({
                userId: loan.userId,
                loanId: loan.id,
                amountCents: overdueFeeCents,
            });
        }

        const copy = await getCopyById(loan.copyId);
        if (copy) {
            const nextHold = await getNextHoldInQueue(copy.bookId);
            if (nextHold) {
                const readyExpiresAt = new Date();
                readyExpiresAt.setDate(readyExpiresAt.getDate() + 7);
                await updateHoldStatus(nextHold.id, {
                    status: "READY",
                    readyExpiresAt: readyExpiresAt.toISOString(),
                });
            }
        }

        return res.json(loan);
    } catch (err) {
        next(err);
    }
}

// Returns a single loan by its ID.
export async function getLoan(req: Request, res: Response, next: NextFunction) {
    try {
        const loanId = requireUuid(req.params.loanId, "loanId");

        const loan = await getLoanById(loanId);
        if (!loan) {
            throw createHttpError(404, "Loan not found.");
        }

        return res.json(loan);
    } catch (err) {
        next(err);
    }
}

// Returns all loans for a user, most recent first.
export async function getUserLoans(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = requireUuid(req.params.userId, "userId");

        const loans = await getLoansByUserId(userId);

        return res.json(loans);
    } catch (err) {
        next(err);
    }
}

// Extends the due date of an active loan and increments renewal_count.
export async function patchLoanRenew(req: Request, res: Response, next: NextFunction) {
    try {
        const loanId = requireUuid(req.params.loanId, "loanId");
        const { dueAt } = req.body;

        if (!dueAt || typeof dueAt !== "string" || isNaN(Date.parse(dueAt))) {
            throw createHttpError(400, "dueAt must be a valid ISO date string.");
        }

        const existing = await getLoanById(loanId);
        if (!existing) {
            throw createHttpError(404, "Loan not found.");
        }
        if (existing.returnedAt !== null) {
            throw createHttpError(409, "Cannot renew a loan that has already been returned.");
        }

        const loan = await renewLoan(loanId, dueAt);
        if (!loan) {
            throw createHttpError(500, "Failed to process renewal.");
        }

        return res.json(loan);
    } catch (err) {
        next(err);
    }
}

// Returns the loan history for a specific copy, most recent first.
export async function getCopyLoans(req: Request, res: Response, next: NextFunction) {
    try {
        const copyId = requireUuid(req.params.copyId, "copyId");

        const loans = await getLoansByCopyId(copyId);

        return res.json(loans);
    } catch (err) {
        next(err);
    }
}
