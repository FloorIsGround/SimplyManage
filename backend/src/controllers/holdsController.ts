import type { NextFunction, Request, Response } from "express";
import {
    createHold,
    getUserActiveHoldForBook,
} from "../models/hold/holdQueries.js";
import { createHttpError, requireUuid } from "./controllerHelpers.js";

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
