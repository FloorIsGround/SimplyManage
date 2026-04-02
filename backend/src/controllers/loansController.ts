import type { NextFunction, Request, Response } from "express";
import { createHttpError, requireUuid } from "./controllerHelpers.js";
import { createLoan, getActiveLoanByCopyId, getLoanById, getLoansByCopyId, getLoansByUserId } from "../models/loan/loanQueries.js";
import { getCopyById } from "../models/copy/copyQueries.js";
import { getUserById } from "../models/user/userQueries.js";

// Checks out a copy to a user, creating a new loan record.
// Validates that the user is ACTIVE and the copy is AVAILABLE with no existing active loan.
export async function postLoan(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = requireUuid(req.body.userId, "userId");
        const copyId = requireUuid(req.body.copyId, "copyId");
        const { dueAt } = req.body;

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

        const copy = await getCopyById(copyId);
        if (!copy) {
            throw createHttpError(404, "Copy not found.");
        }
        if (copy.conditionStatus !== "AVAILABLE") {
            throw createHttpError(409, `Copy is not available for checkout (status: ${copy.conditionStatus}).`);
        }

        const activeLoan = await getActiveLoanByCopyId(copyId);
        if (activeLoan) {
            throw createHttpError(409, "Copy is already checked out.");
        }

        const loan = await createLoan({ userId, copyId, dueAt });

        return res.status(201).json(loan);
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
