import type { NextFunction, Request, Response } from "express";
import {
    createHold,
    getHoldQueuePosition,
    getHoldsByBookId,
    getHoldsByUserId,
    getUserActiveHoldForBook,
} from "../models/hold/holdQueries.js";
import { createHttpError, requireUuid } from "./controllerHelpers.js";

// Returns the full active/ready queue for a book, ordered by queue position.
export async function getBookQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const bookId = requireUuid(req.params.bookId, "bookId");
        const holds = await getHoldsByBookId(bookId);

        return res.json(holds);
    } catch (err) {
        next(err);
    }
}

// Returns the requesting user's queue position for a specific book.
export async function getHoldPosition(req: Request, res: Response, next: NextFunction) {
    try {
        const bookId = requireUuid(req.params.bookId, "bookId");
        const userId = requireUuid(req.params.userId, "userId");

        const hold = await getUserActiveHoldForBook(userId, bookId);
        if (!hold) {
            throw createHttpError(404, "No active hold found for this user and book.");
        }

        const position = await getHoldQueuePosition(hold.id, bookId);
        if (position === null) {
            throw createHttpError(404, "Could not determine queue position.");
        }

        return res.json({ holdId: hold.id, position });
    } catch (err) {
        next(err);
    }
}

// Returns all holds for a user across all books.
export async function getUserHolds(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = requireUuid(req.params.userId, "userId");
        const holds = await getHoldsByUserId(userId);

        return res.json(holds);
    } catch (err) {
        next(err);
    }
}

// Creates a new hold for a user on a book and adds them to the queue.
export async function postHold(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = requireUuid(req.body.userId, "userId");
        const bookId = requireUuid(req.body.bookId, "bookId");

        const existing = await getUserActiveHoldForBook(userId, bookId);
        if (existing) {
            throw createHttpError(409, "User already has an active hold for this book.");
        }

        const hold = await createHold({ userId, bookId });

        return res.status(201).json(hold);
    } catch (err) {
        next(err);
    }
}
