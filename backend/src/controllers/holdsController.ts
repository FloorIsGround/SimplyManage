import type { NextFunction, Request, Response } from "express";
import {
    createHold,
    getHoldById,
    getHoldQueuePosition,
    getHoldsByBookId,
    getHoldsByUserId,
    getUserActiveHoldForBook,
    reorderQueue,
    updateHoldStatus,
} from "../models/hold/holdQueries.js";
import { createHttpError, requireUuid } from "./controllerHelpers.js";
import { HOLD_STATUSES } from "../models/hold/hold.js";
import type { HoldStatus } from "../models/hold/hold.js";

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

// Advances the status of a hold (ACTIVE -> READY -> FULFILLED). Staff only.
export async function patchHoldStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const holdId = requireUuid(req.params.holdId, "holdId");
        const { status, readyExpiresAt } = req.body;

        if (!status || !HOLD_STATUSES.includes(status as HoldStatus)) {
            throw createHttpError(400, `status must be one of: ${HOLD_STATUSES.join(", ")}.`);
        }

        const hold = await getHoldById(holdId);
        if (!hold) {
            throw createHttpError(404, "Hold not found.");
        }

        const updated = await updateHoldStatus(holdId, {
            status: status as HoldStatus,
            readyExpiresAt: readyExpiresAt ?? null,
        });

        return res.json(updated);
    } catch (err) {
        next(err);
    }
}

// Cancels a hold by setting its status to CANCELLED.
export async function removeHold(req: Request, res: Response, next: NextFunction) {
    try {
        const holdId = requireUuid(req.params.holdId, "holdId");

        const hold = await getHoldById(holdId);
        if (!hold) {
            throw createHttpError(404, "Hold not found.");
        }

        if (hold.status === "CANCELLED" || hold.status === "FULFILLED") {
            throw createHttpError(409, "Hold is already closed.");
        }

        await updateHoldStatus(holdId, { status: "CANCELLED" });

        return res.json({ message: "Hold cancelled successfully." });
    } catch (err) {
        next(err);
    }
}

// Reorders the queue for a book. Accepts an ordered array of holdIds and
// reassigns queue_position 1..N accordingly. Staff only.
export async function patchQueueOrder(req: Request, res: Response, next: NextFunction) {
    try {
        const bookId = requireUuid(req.params.bookId, "bookId");
        const { holdIds } = req.body;

        if (!Array.isArray(holdIds) || holdIds.length === 0) {
            throw createHttpError(400, "holdIds must be a non-empty array of UUIDs.");
        }

        for (const id of holdIds) {
            requireUuid(id, "holdIds entry");
        }

        const holds = await reorderQueue(bookId, holdIds);

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
