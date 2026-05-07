import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import type { Book } from "../models/book/book.js";

// Mock the entire book query layer so tests never touch the database.
vi.mock("../models/book/bookQueries.js", () => ({
  getAllBooks: vi.fn(),
  searchBooksByQuery: vi.fn(),
  getBookById: vi.fn(),
  getBookByIsbn: vi.fn(),
  createBook: vi.fn(),
  updateBook: vi.fn(),
  deleteBook: vi.fn(),
}));

import {
  getAllBooks,
  searchBooksByQuery,
  getBookById,
  getBookByIsbn,
  createBook,
  updateBook,
  deleteBook,
} from "../models/book/bookQueries.js";

const mockAllBooks = vi.mocked(getAllBooks);
const mockSearchBooks = vi.mocked(searchBooksByQuery);
const mockGetById = vi.mocked(getBookById);
const mockGetByIsbn = vi.mocked(getBookByIsbn);
const mockCreate = vi.mocked(createBook);
const mockUpdate = vi.mocked(updateBook);
const mockDelete = vi.mocked(deleteBook);

const app = createApp();

const sampleBook: Book = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  isbn: 9780143127741,
  title: "The Martian",
  author: "Andy Weir",
  genre: "Science Fiction",
  description: "A stranded astronaut must survive on Mars.",
  publicationYear: 2014,
  createdAt: "2024-01-01T00:00:00.000Z",
  averageRating: 4,
  audience: "Adult",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /api/books
// ---------------------------------------------------------------------------
describe("GET /api/books", () => {
  it("returns all books as an array", async () => {
    mockAllBooks.mockResolvedValue([sampleBook]);

    const res = await request(app).get("/api/books");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([sampleBook]);
  });

  it("returns an empty array when there are no books", async () => {
    mockAllBooks.mockResolvedValue([]);

    const res = await request(app).get("/api/books");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// GET /api/books/search?searchQuery=:searchQuery
// ---------------------------------------------------------------------------
describe("GET /api/books/search", () => {
  it("returns matching books", async () => {
    mockSearchBooks.mockResolvedValue([sampleBook]);

    const res = await request(app).get("/api/books/search?searchQuery=martian");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([sampleBook]);
    expect(mockSearchBooks).toHaveBeenCalledWith({
      searchQuery: "martian",
      genre: "",
      audience: "",
      rating: undefined,
      barcode: undefined,
    });
  });

  it("returns empty array when no books match", async () => {
    mockSearchBooks.mockResolvedValue([]);

    const res = await request(app).get("/api/books/search?searchQuery=zzznomatch");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// GET /api/books/:bookId
// ---------------------------------------------------------------------------
describe("GET /api/books/:bookId", () => {
  it("returns a book when found", async () => {
    mockGetById.mockResolvedValue(sampleBook);

    const res = await request(app).get(`/api/books/${sampleBook.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(sampleBook);
  });

  it("returns 404 when book does not exist", async () => {
    mockGetById.mockResolvedValue(null);

    const res = await request(app).get(`/api/books/${sampleBook.id}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid UUID", async () => {
    const res = await request(app).get("/api/books/not-a-uuid");

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/books/isbn/:isbn
// ---------------------------------------------------------------------------
describe("GET /api/books/isbn/:isbn", () => {
  it("returns a book when found by ISBN", async () => {
    mockGetByIsbn.mockResolvedValue(sampleBook);

    const res = await request(app).get("/api/books/isbn/9780143127741");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(sampleBook);
  });

  it("returns 404 when ISBN does not match any book", async () => {
    mockGetByIsbn.mockResolvedValue(null);

    const res = await request(app).get("/api/books/isbn/9780000000000");

    expect(res.status).toBe(404);
  });

  it("returns 400 for a non-numeric ISBN", async () => {
    const res = await request(app).get("/api/books/isbn/not-a-number");

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/books
// ---------------------------------------------------------------------------
describe("POST /api/books", () => {
  const newBookBody = {
    isbn: "9780143127741",
    title: "The Martian",
    author: "Andy Weir",
    audience: "Adult",
    genre: "Science Fiction",
    description: "A stranded astronaut must survive on Mars.",
    publicationYear: 2014,
  };

  it("creates a book and returns 201", async () => {
    mockCreate.mockResolvedValue(sampleBook);

    const res = await request(app).post("/api/books").send(newBookBody);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(sampleBook);
  });

  it("returns 400 when title is missing", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ ...newBookBody, title: undefined });

    expect(res.status).toBe(400);
  });

  it("returns 400 when author is missing", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ ...newBookBody, author: undefined });

    expect(res.status).toBe(400);
  });

  it("returns 400 when isbn is missing", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ ...newBookBody, isbn: undefined });

    expect(res.status).toBe(400);
  });

  it("returns 400 when audience is missing", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ ...newBookBody, audience: undefined });

    expect(res.status).toBe(400);
  });

  it("returns 409 when ISBN already exists", async () => {
    const duplicateError = Object.assign(new Error("duplicate key"), { code: "23505" });
    mockCreate.mockRejectedValue(duplicateError);

    const res = await request(app).post("/api/books").send(newBookBody);

    expect(res.status).toBe(409);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/books/:bookId
// ---------------------------------------------------------------------------
describe("PATCH /api/books/:bookId", () => {
  it("updates a book and returns the updated record", async () => {
    const updated = { ...sampleBook, title: "The Martian: Updated" };
    mockUpdate.mockResolvedValue(updated);

    const res = await request(app)
      .patch(`/api/books/${sampleBook.id}`)
      .send({ title: "The Martian: Updated" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("The Martian: Updated");
  });

  it("returns 400 when no fields are provided", async () => {
    const res = await request(app)
      .patch(`/api/books/${sampleBook.id}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 404 when book does not exist", async () => {
    mockUpdate.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/books/${sampleBook.id}`)
      .send({ title: "Ghost Book" });

    expect(res.status).toBe(404);
  });

  it("returns 409 when patched ISBN conflicts with another book", async () => {
    const duplicateError = Object.assign(new Error("duplicate key"), { code: "23505" });
    mockUpdate.mockRejectedValue(duplicateError);

    const res = await request(app)
      .patch(`/api/books/${sampleBook.id}`)
      .send({ isbn: "9780143127741" });

    expect(res.status).toBe(409);
  });

  it("returns 400 for an invalid bookId UUID", async () => {
    const res = await request(app)
      .patch("/api/books/not-a-uuid")
      .send({ title: "Test" });

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/books/:bookId
// ---------------------------------------------------------------------------
describe("DELETE /api/books/:bookId", () => {
  it("deletes a book and returns a success message", async () => {
    mockDelete.mockResolvedValue(true);

    const res = await request(app).delete(`/api/books/${sampleBook.id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Book deleted successfully.");
  });

  it("returns 404 when book does not exist", async () => {
    mockDelete.mockResolvedValue(false);

    const res = await request(app).delete(`/api/books/${sampleBook.id}`);

    expect(res.status).toBe(404);
  });

  it("returns 409 when book has existing copies", async () => {
    const fkError = Object.assign(new Error("foreign key violation"), { code: "23503" });
    mockDelete.mockRejectedValue(fkError);

    const res = await request(app).delete(`/api/books/${sampleBook.id}`);

    expect(res.status).toBe(409);
  });

  it("returns 400 for an invalid bookId UUID", async () => {
    const res = await request(app).delete("/api/books/not-a-uuid");

    expect(res.status).toBe(400);
  });
});
