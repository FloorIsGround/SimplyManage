import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import type { Copy } from "../models/copy/copy.js";

// Mock the entire copy query layer so tests never touch the database.
vi.mock("../models/copy/copyQueries.js", () => ({
  getCopiesByBookId: vi.fn(),
  getCopyByBarcode: vi.fn(),
  createCopies: vi.fn(),
  updateCopyStatus: vi.fn(),
}));

import {
  getCopiesByBookId,
  getCopyByBarcode,
  createCopies,
  updateCopyStatus,
} from "../models/copy/copyQueries.js";

const mockGetByBookId = vi.mocked(getCopiesByBookId);
const mockGetByBarcode = vi.mocked(getCopyByBarcode);
const mockCreate = vi.mocked(createCopies);
const mockUpdateStatus = vi.mocked(updateCopyStatus);

const app = createApp();

const sampleCopy: Copy = {
  id: "223e4567-e89b-12d3-a456-426614174001",
  bookId: "123e4567-e89b-12d3-a456-426614174000",
  barcode: "BC00000001",
  conditionStatus: "AVAILABLE",
  branchId: 1,
  createdAt: "2024-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /api/copies/book/:bookId
// ---------------------------------------------------------------------------
describe("GET /api/copies/book/:bookId", () => {
  it("returns all copies for a book", async () => {
    mockGetByBookId.mockResolvedValue([sampleCopy]);

    const res = await request(app).get(`/api/copies/book/${sampleCopy.bookId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([sampleCopy]);
    expect(mockGetByBookId).toHaveBeenCalledWith(sampleCopy.bookId);
  });

  it("returns empty array when book has no copies", async () => {
    mockGetByBookId.mockResolvedValue([]);

    const res = await request(app).get(`/api/copies/book/${sampleCopy.bookId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 400 for an invalid bookId UUID", async () => {
    const res = await request(app).get("/api/copies/book/not-a-uuid");

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/copies/barcode/:barcode
// ---------------------------------------------------------------------------
describe("GET /api/copies/barcode/:barcode", () => {
  it("returns a copy when found by barcode", async () => {
    mockGetByBarcode.mockResolvedValue(sampleCopy);

    const res = await request(app).get("/api/copies/barcode/BC00000001");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(sampleCopy);
    expect(mockGetByBarcode).toHaveBeenCalledWith("BC00000001");
  });

  it("returns 404 when barcode does not match any copy", async () => {
    mockGetByBarcode.mockResolvedValue(null);

    const res = await request(app).get("/api/copies/barcode/BC99999999");

    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /api/copies
// ---------------------------------------------------------------------------
describe("POST /api/copies", () => {
  const newCopiesBody = {
    bookId: "123e4567-e89b-12d3-a456-426614174000",
    quantity: 2,
    conditionStatus: "AVAILABLE",
    branchId: 1,
  };

  it("creates copies and returns 201", async () => {
    mockCreate.mockResolvedValue([sampleCopy, { ...sampleCopy, id: "323e4567-e89b-12d3-a456-426614174002", barcode: "BC00000002" }]);

    const res = await request(app).post("/api/copies").send(newCopiesBody);

    expect(res.status).toBe(201);
    expect(res.body).toHaveLength(2);
  });

  it("returns 400 when bookId is missing", async () => {
    const res = await request(app)
      .post("/api/copies")
      .send({ ...newCopiesBody, bookId: undefined });

    expect(res.status).toBe(400);
  });

  it("returns 400 when bookId is not a valid UUID", async () => {
    const res = await request(app)
      .post("/api/copies")
      .send({ ...newCopiesBody, bookId: "not-a-uuid" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when quantity is not a positive integer", async () => {
    const res = await request(app)
      .post("/api/copies")
      .send({ ...newCopiesBody, quantity: 0 });

    expect(res.status).toBe(400);
  });

  it("returns 400 when conditionStatus is invalid", async () => {
    const res = await request(app)
      .post("/api/copies")
      .send({ ...newCopiesBody, conditionStatus: "PERFECT" });

    expect(res.status).toBe(400);
  });

  it("returns 404 when book does not exist", async () => {
    const fkError = Object.assign(new Error("foreign key violation"), { code: "23503" });
    mockCreate.mockRejectedValue(fkError);

    const res = await request(app).post("/api/copies").send(newCopiesBody);

    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/copies/barcode/:barcode/status
// ---------------------------------------------------------------------------
describe("PATCH /api/copies/barcode/:barcode/status", () => {
  it("updates the condition status and returns the updated copy", async () => {
    const updated = { ...sampleCopy, conditionStatus: "DAMAGED" as const };
    mockUpdateStatus.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/copies/barcode/BC00000001/status")
      .send({ conditionStatus: "DAMAGED" });

    expect(res.status).toBe(200);
    expect(res.body.conditionStatus).toBe("DAMAGED");
  });

  it("returns 400 when conditionStatus is invalid", async () => {
    const res = await request(app)
      .patch("/api/copies/barcode/BC00000001/status")
      .send({ conditionStatus: "SHINY" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when conditionStatus is missing", async () => {
    const res = await request(app)
      .patch("/api/copies/barcode/BC00000001/status")
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 404 when barcode does not match any copy", async () => {
    mockUpdateStatus.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/copies/barcode/BC99999999/status")
      .send({ conditionStatus: "LOST" });

    expect(res.status).toBe(404);
  });
});
