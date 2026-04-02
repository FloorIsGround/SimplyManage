import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import type { Hold } from "../models/hold/hold.js";

// Mock the entire hold query layer so tests never touch the database.
vi.mock("../models/hold/holdQueries.js", () => ({
    createHold: vi.fn(),
    getHoldsByBookId: vi.fn(),
    getHoldsByUserId: vi.fn(),
    getHoldById: vi.fn(),
    getHoldQueuePosition: vi.fn(),
    getUserActiveHoldForBook: vi.fn(),
    updateHoldStatus: vi.fn(),
    reorderQueue: vi.fn(),
}));

import {
    createHold,
    getHoldsByBookId,
    getHoldsByUserId,
    getHoldById,
    getHoldQueuePosition,
    getUserActiveHoldForBook,
    updateHoldStatus,
    reorderQueue,
} from "../models/hold/holdQueries.js";

const mockCreateHold = vi.mocked(createHold);
const mockGetHoldsByBookId = vi.mocked(getHoldsByBookId);
const mockGetHoldsByUserId = vi.mocked(getHoldsByUserId);
const mockGetHoldById = vi.mocked(getHoldById);
const mockGetHoldQueuePosition = vi.mocked(getHoldQueuePosition);
const mockGetUserActiveHoldForBook = vi.mocked(getUserActiveHoldForBook);
const mockUpdateHoldStatus = vi.mocked(updateHoldStatus);
const mockReorderQueue = vi.mocked(reorderQueue);

const app = createApp();

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const BOOK_ID = "223e4567-e89b-12d3-a456-426614174001";
const HOLD_ID = "323e4567-e89b-12d3-a456-426614174002";
const HOLD_ID_2 = "423e4567-e89b-12d3-a456-426614174003";

const sampleHold: Hold = {
    id: HOLD_ID,
    userId: USER_ID,
    bookId: BOOK_ID,
    placedAt: "2026-01-01T00:00:00.000Z",
    status: "ACTIVE",
    readyExpiresAt: null,
    queuePosition: 1,
};

const sampleHold2: Hold = {
    id: HOLD_ID_2,
    userId: "55555555-5555-5555-5555-555555555555",
    bookId: BOOK_ID,
    placedAt: "2026-01-02T00:00:00.000Z",
    status: "ACTIVE",
    readyExpiresAt: null,
    queuePosition: 2,
};

beforeEach(() => {
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// POST /api/holds
// ---------------------------------------------------------------------------
describe("POST /api/holds", () => {
    it("creates a hold and returns 201", async () => {
        mockGetUserActiveHoldForBook.mockResolvedValue(null);
        mockCreateHold.mockResolvedValue(sampleHold);

        const res = await request(app)
            .post("/api/holds")
            .send({ userId: USER_ID, bookId: BOOK_ID });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(sampleHold);
    });

    it("returns 400 when userId is missing", async () => {
        const res = await request(app)
            .post("/api/holds")
            .send({ bookId: BOOK_ID });

        expect(res.status).toBe(400);
    });

    it("returns 400 when bookId is missing", async () => {
        const res = await request(app)
            .post("/api/holds")
            .send({ userId: USER_ID });

        expect(res.status).toBe(400);
    });

    it("returns 400 when userId is not a valid UUID", async () => {
        const res = await request(app)
            .post("/api/holds")
            .send({ userId: "not-a-uuid", bookId: BOOK_ID });

        expect(res.status).toBe(400);
    });

    it("returns 409 when user already has an active hold for the book", async () => {
        mockGetUserActiveHoldForBook.mockResolvedValue(sampleHold);

        const res = await request(app)
            .post("/api/holds")
            .send({ userId: USER_ID, bookId: BOOK_ID });

        expect(res.status).toBe(409);
    });
});

// ---------------------------------------------------------------------------
// GET /api/holds/book/:bookId
// ---------------------------------------------------------------------------
describe("GET /api/holds/book/:bookId", () => {
    it("returns the queue for a book ordered by position", async () => {
        mockGetHoldsByBookId.mockResolvedValue([sampleHold, sampleHold2]);

        const res = await request(app).get(`/api/holds/book/${BOOK_ID}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].queuePosition).toBe(1);
        expect(res.body[1].queuePosition).toBe(2);
    });

    it("returns an empty array when no active holds exist", async () => {
        mockGetHoldsByBookId.mockResolvedValue([]);

        const res = await request(app).get(`/api/holds/book/${BOOK_ID}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("returns 400 for an invalid bookId UUID", async () => {
        const res = await request(app).get("/api/holds/book/not-a-uuid");

        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// GET /api/holds/book/:bookId/position/:userId
// ---------------------------------------------------------------------------
describe("GET /api/holds/book/:bookId/position/:userId", () => {
    it("returns the queue position for a user's hold", async () => {
        mockGetUserActiveHoldForBook.mockResolvedValue(sampleHold);
        mockGetHoldQueuePosition.mockResolvedValue(1);

        const res = await request(app).get(
            `/api/holds/book/${BOOK_ID}/position/${USER_ID}`
        );

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ holdId: HOLD_ID, position: 1 });
    });

    it("returns 404 when the user has no active hold for the book", async () => {
        mockGetUserActiveHoldForBook.mockResolvedValue(null);

        const res = await request(app).get(
            `/api/holds/book/${BOOK_ID}/position/${USER_ID}`
        );

        expect(res.status).toBe(404);
    });

    it("returns 400 for an invalid userId UUID", async () => {
        const res = await request(app).get(
            `/api/holds/book/${BOOK_ID}/position/not-a-uuid`
        );

        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// GET /api/holds/user/:userId
// ---------------------------------------------------------------------------
describe("GET /api/holds/user/:userId", () => {
    it("returns all holds for a user", async () => {
        mockGetHoldsByUserId.mockResolvedValue([sampleHold]);

        const res = await request(app).get(`/api/holds/user/${USER_ID}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].userId).toBe(USER_ID);
    });

    it("returns an empty array when user has no holds", async () => {
        mockGetHoldsByUserId.mockResolvedValue([]);

        const res = await request(app).get(`/api/holds/user/${USER_ID}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("returns 400 for an invalid userId UUID", async () => {
        const res = await request(app).get("/api/holds/user/not-a-uuid");

        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// PATCH /api/holds/:holdId/status
// ---------------------------------------------------------------------------
describe("PATCH /api/holds/:holdId/status", () => {
    it("advances hold to READY and returns the updated hold", async () => {
        const readyHold = { ...sampleHold, status: "READY" as const, readyExpiresAt: "2026-02-01T00:00:00.000Z" };
        mockGetHoldById.mockResolvedValue(sampleHold);
        mockUpdateHoldStatus.mockResolvedValue(readyHold);

        const res = await request(app)
            .patch(`/api/holds/${HOLD_ID}/status`)
            .send({ status: "READY", readyExpiresAt: "2026-02-01T00:00:00.000Z" });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe("READY");
        expect(res.body.readyExpiresAt).toBe("2026-02-01T00:00:00.000Z");
    });

    it("returns 400 when status is missing", async () => {
        const res = await request(app)
            .patch(`/api/holds/${HOLD_ID}/status`)
            .send({});

        expect(res.status).toBe(400);
    });

    it("returns 400 when status is invalid", async () => {
        const res = await request(app)
            .patch(`/api/holds/${HOLD_ID}/status`)
            .send({ status: "PENDING" });

        expect(res.status).toBe(400);
    });

    it("returns 404 when hold does not exist", async () => {
        mockGetHoldById.mockResolvedValue(null);

        const res = await request(app)
            .patch(`/api/holds/${HOLD_ID}/status`)
            .send({ status: "READY" });

        expect(res.status).toBe(404);
    });

    it("returns 400 for an invalid holdId UUID", async () => {
        const res = await request(app)
            .patch("/api/holds/not-a-uuid/status")
            .send({ status: "READY" });

        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// DELETE /api/holds/:holdId
// ---------------------------------------------------------------------------
describe("DELETE /api/holds/:holdId", () => {
    it("cancels a hold and returns a success message", async () => {
        mockGetHoldById.mockResolvedValue(sampleHold);
        mockUpdateHoldStatus.mockResolvedValue({ ...sampleHold, status: "CANCELLED" });

        const res = await request(app).delete(`/api/holds/${HOLD_ID}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message");
    });

    it("returns 404 when hold does not exist", async () => {
        mockGetHoldById.mockResolvedValue(null);

        const res = await request(app).delete(`/api/holds/${HOLD_ID}`);

        expect(res.status).toBe(404);
    });

    it("returns 409 when hold is already cancelled", async () => {
        mockGetHoldById.mockResolvedValue({ ...sampleHold, status: "CANCELLED" });

        const res = await request(app).delete(`/api/holds/${HOLD_ID}`);

        expect(res.status).toBe(409);
    });

    it("returns 409 when hold is already fulfilled", async () => {
        mockGetHoldById.mockResolvedValue({ ...sampleHold, status: "FULFILLED" });

        const res = await request(app).delete(`/api/holds/${HOLD_ID}`);

        expect(res.status).toBe(409);
    });

    it("returns 400 for an invalid holdId UUID", async () => {
        const res = await request(app).delete("/api/holds/not-a-uuid");

        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// PATCH /api/holds/book/:bookId/reorder
// ---------------------------------------------------------------------------
describe("PATCH /api/holds/book/:bookId/reorder", () => {
    it("reorders the queue and returns holds in new order", async () => {
        const reordered = [
            { ...sampleHold2, queuePosition: 1 },
            { ...sampleHold, queuePosition: 2 },
        ];
        mockReorderQueue.mockResolvedValue(reordered);

        const res = await request(app)
            .patch(`/api/holds/book/${BOOK_ID}/reorder`)
            .send({ holdIds: [HOLD_ID_2, HOLD_ID] });

        expect(res.status).toBe(200);
        expect(res.body[0].id).toBe(HOLD_ID_2);
        expect(res.body[0].queuePosition).toBe(1);
        expect(res.body[1].id).toBe(HOLD_ID);
        expect(res.body[1].queuePosition).toBe(2);
    });

    it("returns 400 when holdIds is missing", async () => {
        const res = await request(app)
            .patch(`/api/holds/book/${BOOK_ID}/reorder`)
            .send({});

        expect(res.status).toBe(400);
    });

    it("returns 400 when holdIds is an empty array", async () => {
        const res = await request(app)
            .patch(`/api/holds/book/${BOOK_ID}/reorder`)
            .send({ holdIds: [] });

        expect(res.status).toBe(400);
    });

    it("returns 400 when holdIds contains an invalid UUID", async () => {
        const res = await request(app)
            .patch(`/api/holds/book/${BOOK_ID}/reorder`)
            .send({ holdIds: [HOLD_ID, "not-a-uuid"] });

        expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid bookId UUID", async () => {
        const res = await request(app)
            .patch("/api/holds/book/not-a-uuid/reorder")
            .send({ holdIds: [HOLD_ID] });

        expect(res.status).toBe(400);
    });
});
