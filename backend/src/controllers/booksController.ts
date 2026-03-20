import type { NextFunction, Request, Response } from "express";
import { getBookById, getBookByIsbn } from "../models/book/bookQueries.js";
import { createHttpError, requireUuid, requirePositiveInt } from "./controllerHelpers.js";

// Gets a single book by its UUID.
export async function getBookId(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = requireUuid(req.params.bookId, "bookId");
    const book = await getBookById(bookId);

    if (!book) {
      throw createHttpError(404, "Book not found.");
    }

    return res.json(book);
  } catch (err) {
    next(err);
  }
}

// Gets a single book by its ISBN.
export async function getBookIsbn(req: Request, res: Response, next: NextFunction) {
  try {
    const isbn = requirePositiveInt(req.params.isbn, "isbn");
    const book = await getBookByIsbn(isbn);

    if (!book) {
      throw createHttpError(404, "Book not found.");
    }

    return res.json(book);
  } catch (err) {
    next(err);
  }
}
