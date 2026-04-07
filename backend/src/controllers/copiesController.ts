import type { NextFunction, Request, Response } from "express";
import { getCopiesByBookId, getCopyByBarcode, createCopies, updateCopyStatus } from "../models/copy/copyQueries.js";
import { createHttpError, requireUuid } from "./controllerHelpers.js";
import { CONDITION_STATUSES } from "../models/copy/copy.js";
import type { CreateCopiesInput, UpdateCopyStatusInput } from "../models/copy/copyQueries.js";

// Gets all copies for a book.
export async function getCopiesBook(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = requireUuid(req.params.bookId, "bookId");
    const copies = await getCopiesByBookId(bookId);
    return res.json(copies);
  } catch (err) {
    next(err);
  }
}

// Gets a single copy by barcode.
export async function getCopyBarcode(req: Request, res: Response, next: NextFunction) {
  try {
    const { barcode } = req.params;
    if (!barcode || typeof barcode !== "string") {
      throw createHttpError(400, "barcode is required.");
    }

    const copy = await getCopyByBarcode(barcode);

    if (!copy) {
      throw createHttpError(404, "Copy not found.");
    }

    return res.json(copy);
  } catch (err) {
    next(err);
  }
}

// Creates one or more copies for a book.
export async function postCopies(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookId, quantity, conditionStatus, location } = req.body;

    const validatedBookId = requireUuid(bookId, "bookId");

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      throw createHttpError(400, "quantity must be a positive integer.");
    }

    if (!conditionStatus || !CONDITION_STATUSES.includes(conditionStatus)) {
      throw createHttpError(400, `conditionStatus must be one of: ${CONDITION_STATUSES.join(", ")}.`);
    }

    const input: CreateCopiesInput = {
      bookId: validatedBookId,
      quantity: parsedQuantity,
      conditionStatus,
      location: location != null ? String(location) : null,
    };

    const copies = await createCopies(input);
    return res.status(201).json(copies);
  } catch (err: any) {
    if (err?.code === "23503") {
      return next(createHttpError(404, "Book not found."));
    }
    next(err);
  }
}

// Updates the condition status of a copy by barcode.
export async function patchCopyStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { barcode } = req.params;
    if (!barcode || typeof barcode !== "string") {
      throw createHttpError(400, "barcode is required.");
    }

    const { conditionStatus } = req.body;
    if (!conditionStatus || !CONDITION_STATUSES.includes(conditionStatus)) {
      throw createHttpError(400, `conditionStatus must be one of: ${CONDITION_STATUSES.join(", ")}.`);
    }

    const input: UpdateCopyStatusInput = { conditionStatus };
    const copy = await updateCopyStatus(barcode, input);

    if (!copy) {
      throw createHttpError(404, "Copy not found.");
    }

    return res.json(copy);
  } catch (err) {
    next(err);
  }
}
