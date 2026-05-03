import type { NextFunction, Request, Response } from "express";
import { getAllBooks, searchBooksByQuery, getBookById, getBookByIsbn, createBook, updateBook, deleteBook } from "../models/book/bookQueries.js";
import { createHttpError, requireUuid, requirePositiveInt } from "./controllerHelpers.js";
import type { CreateBookInput, UpdateBookInput } from "../models/book/bookQueries.js";

// Gets all books.
export async function getBooks(_req: Request, res: Response, next: NextFunction) {
  try {
    const books = await getAllBooks();
    return res.json(books);
  } catch (err) {
    next(err);
  }
}

// Searches books by title, author, genre, audience, and rating.
export async function searchBooks(req: Request, res: Response, next: NextFunction) {
  try {
    const { searchQuery, genre, audience, rating, barcode } = req.query;
    const books = await searchBooksByQuery({
      searchQuery: typeof searchQuery === 'string' ? searchQuery : '',
      genre: typeof genre === 'string' ? genre : '',
      audience: typeof audience === 'string' ? audience : '',
      rating: typeof rating === 'string' ? Number(rating) : undefined,
      barcode: typeof barcode === 'string' ? barcode : undefined,
    });
    return res.json(books);
  } catch (err) {
    next(err);
  }
}

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

// Creates a new book.
export async function postBook(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, author, isbn, audience, genre, description, publicationYear } = req.body;

    if (!title || typeof title !== "string") throw createHttpError(400, "title is required.");
    if (!author || typeof author !== "string") throw createHttpError(400, "author is required.");
    if (!isbn || typeof isbn !== "string") throw createHttpError(400, "isbn is required.");
    if (!audience || typeof audience !== "string") throw createHttpError(400, "audience is required.");

    const input: CreateBookInput = {
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      audience: audience.trim(),
      genre: genre != null ? String(genre) : null,
      description: description != null ? String(description) : null,
      publicationYear: publicationYear != null ? Number(publicationYear) : null,
    };

    const book = await createBook(input);
    return res.status(201).json(book);
  } catch (err: any) {
    if (err?.code === "23505") {
      return next(createHttpError(409, "A book with that ISBN already exists."));
    }
    next(err);
  }
}

// Updates a book by its UUID.
export async function patchBook(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = requireUuid(req.params.bookId, "bookId");
    const { isbn, title, author, audience, genre, description, publicationYear } = req.body;

    if ([isbn, title, author, audience, genre, description, publicationYear].every(v => v === undefined)) {
      throw createHttpError(400, "At least one field must be provided.");
    }

    const input: UpdateBookInput = {};
    if (isbn !== undefined) input.isbn = String(isbn).trim();
    if (title !== undefined) input.title = String(title).trim();
    if (author !== undefined) input.author = String(author).trim();
    if (audience !== undefined) input.audience = String(audience).trim();
    if (genre !== undefined) input.genre = genre === null ? null : String(genre);
    if (description !== undefined) input.description = description === null ? null : String(description);
    if (publicationYear !== undefined) input.publicationYear = publicationYear === null ? null : Number(publicationYear);

    const book = await updateBook(bookId, input);

    if (!book) {
      throw createHttpError(404, "Book not found.");
    }

    return res.json(book);
  } catch (err: any) {
    if (err?.code === "23505") {
      return next(createHttpError(409, "A book with that ISBN already exists."));
    }
    next(err);
  }
}

// Deletes a book by its UUID.
export async function removeBook(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = requireUuid(req.params.bookId, "bookId");
    const deleted = await deleteBook(bookId);

    if (!deleted) {
      throw createHttpError(404, "Book not found.");
    }

    return res.json({ message: "Book deleted successfully." });
  } catch (err: any) {
    if (err?.code === "23503") {
      return next(createHttpError(409, "Cannot delete book with existing copies."));
    }
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
