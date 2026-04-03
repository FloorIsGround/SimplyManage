import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import type { Loan } from "../models/loan/loan.js";
import type { Copy } from "../models/copy/copy.js";
import type { User } from "../models/user/user.js";
import type { Hold } from "../models/hold/hold.js";

// Mock all query layers so tests never touch the database.
vi.mock("../models/loan/loanQueries.js", () => ({
    createLoan: vi.fn(),
    getActiveLoanByCopyId: vi.fn(),
    getLoanById: vi.fn(),
    getLoansByUserId: vi.fn(),
    getLoansByCopyId: vi.fn(),
    returnLoan: vi.fn(),
    renewLoan: vi.fn(),
}));

vi.mock("../models/copy/copyQueries.js", () => ({
    getCopyById: vi.fn(),
    getCopiesByBookId: vi.fn(),
    getCopyByBarcode: vi.fn(),
    createCopies: vi.fn(),
    updateCopyStatus: vi.fn(),
}));

vi.mock("../models/user/userQueries.js", () => ({
    getUserById: vi.fn(),
    getUserByEmail: vi.fn(),
    createStaffUser: vi.fn(),
    updateUser: vi.fn(),
    updateUserStatus: vi.fn(),
    verifyUserPassword: vi.fn(),
    updateUserPassword: vi.fn(),
    deleteUser: vi.fn(),
}));

vi.mock("../models/hold/holdQueries.js", () => ({
    createHold: vi.fn(),
    getHoldsByBookId: vi.fn(),
    getHoldsByUserId: vi.fn(),
    getHoldById: vi.fn(),
    getHoldQueuePosition: vi.fn(),
    getUserActiveHoldForBook: vi.fn(),
    updateHoldStatus: vi.fn(),
    reorderQueue: vi.fn(),
    getNextHoldInQueue: vi.fn(),
}));

import {
    createLoan,
    getActiveLoanByCopyId,
    getLoanById,
    getLoansByUserId,
    getLoansByCopyId,
    returnLoan,
    renewLoan,
} from "../models/loan/loanQueries.js";
import { getCopyById } from "../models/copy/copyQueries.js";
import { getUserById } from "../models/user/userQueries.js";
import { getNextHoldInQueue, updateHoldStatus } from "../models/hold/holdQueries.js";

const mockCreateLoan = vi.mocked(createLoan);
const mockGetActiveLoanByCopyId = vi.mocked(getActiveLoanByCopyId);
const mockGetLoanById = vi.mocked(getLoanById);
const mockGetLoansByUserId = vi.mocked(getLoansByUserId);
const mockGetLoansByCopyId = vi.mocked(getLoansByCopyId);
const mockReturnLoan = vi.mocked(returnLoan);
const mockRenewLoan = vi.mocked(renewLoan);
const mockGetCopyById = vi.mocked(getCopyById);
const mockGetUserById = vi.mocked(getUserById);
const mockGetNextHoldInQueue = vi.mocked(getNextHoldInQueue);
const mockUpdateHoldStatus = vi.mocked(updateHoldStatus);

const app = createApp();

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const COPY_ID = "223e4567-e89b-12d3-a456-426614174001";
const LOAN_ID = "323e4567-e89b-12d3-a456-426614174002";
const BOOK_ID = "423e4567-e89b-12d3-a456-426614174003";
const HOLD_ID = "523e4567-e89b-12d3-a456-426614174004";
const DUE_AT = "2026-04-16T00:00:00.000Z";

const sampleLoan: Loan = {
    id: LOAN_ID,
    userId: USER_ID,
    copyId: COPY_ID,
    checkoutAt: "2026-04-02T00:00:00.000Z",
    dueAt: DUE_AT,
    returnedAt: null,
    renewalCount: 0,
};

const sampleCopy: Copy = {
    id: COPY_ID,
    bookId: BOOK_ID,
    barcode: "BC00000001",
    conditionStatus: "AVAILABLE",
    location: "Central Library",
    createdAt: "2026-01-01T00:00:00.000Z",
};

const sampleUser: User = {
    id: USER_ID,
    email: "patron@example.com",
    firstName: "Carol",
    lastName: "Patron",
    role: "PATRON",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
};

const sampleHold: Hold = {
    id: HOLD_ID,
    userId: "999e4567-e89b-12d3-a456-426614174099",
    bookId: BOOK_ID,
    placedAt: "2026-03-01T00:00:00.000Z",
    status: "ACTIVE",
    readyExpiresAt: null,
    queuePosition: 1,
};

beforeEach(() => {
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// POST /api/loans
// ---------------------------------------------------------------------------
describe("POST /api/loans", () => {
    it("creates a loan and returns 201", async () => {
        mockGetUserById.mockResolvedValue(sampleUser);
        mockGetCopyById.mockResolvedValue(sampleCopy);
        mockGetActiveLoanByCopyId.mockResolvedValue(null);
        mockCreateLoan.mockResolvedValue(sampleLoan);

        const res = await request(app)
            .post("/api/loans")
            .send({ userId: USER_ID, copyId: COPY_ID, dueAt: DUE_AT });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(sampleLoan);
    });

    it("returns 400 when userId is missing", async () => {
        const res = await request(app)
            .post("/api/loans")
            .send({ copyId: COPY_ID, dueAt: DUE_AT });

        expect(res.status).toBe(400);
    });

    it("returns 400 when copyId is missing", async () => {
        const res = await request(app)
            .post("/api/loans")
            .send({ userId: USER_ID, dueAt: DUE_AT });

        expect(res.status).toBe(400);
    });

    it("returns 400 when dueAt is missing", async () => {
        const res = await request(app)
            .post("/api/loans")
            .send({ userId: USER_ID, copyId: COPY_ID });

        expect(res.status).toBe(400);
    });

    it("returns 400 when dueAt is not a valid date string", async () => {
        const res = await request(app)
            .post("/api/loans")
            .send({ userId: USER_ID, copyId: COPY_ID, dueAt: "not-a-date" });

        expect(res.status).toBe(400);
    });

    it("returns 404 when user does not exist", async () => {
        mockGetUserById.mockResolvedValue(null);

        const res = await request(app)
            .post("/api/loans")
            .send({ userId: USER_ID, copyId: COPY_ID, dueAt: DUE_AT });

        expect(res.status).toBe(404);
    });

    it("returns 403 when user is suspended", async () => {
        mockGetUserById.mockResolvedValue({ ...sampleUser, status: "SUSPENDED" });

        const res = await request(app)
            .post("/api/loans")
            .send({ userId: USER_ID, copyId: COPY_ID, dueAt: DUE_AT });

        expect(res.status).toBe(403);
    });

    it("returns 404 when copy does not exist", async () => {
        mockGetUserById.mockResolvedValue(sampleUser);
        mockGetCopyById.mockResolvedValue(null);

        const res = await request(app)
            .post("/api/loans")
            .send({ userId: USER_ID, copyId: COPY_ID, dueAt: DUE_AT });

        expect(res.status).toBe(404);
    });

    it("returns 409 when copy is not in AVAILABLE condition", async () => {
        mockGetUserById.mockResolvedValue(sampleUser);
        mockGetCopyById.mockResolvedValue({ ...sampleCopy, conditionStatus: "DAMAGED" });

        const res = await request(app)
            .post("/api/loans")
            .send({ userId: USER_ID, copyId: COPY_ID, dueAt: DUE_AT });

        expect(res.status).toBe(409);
    });

    it("returns 409 when copy is already checked out", async () => {
        mockGetUserById.mockResolvedValue(sampleUser);
        mockGetCopyById.mockResolvedValue(sampleCopy);
        mockGetActiveLoanByCopyId.mockResolvedValue(sampleLoan);

        const res = await request(app)
            .post("/api/loans")
            .send({ userId: USER_ID, copyId: COPY_ID, dueAt: DUE_AT });

        expect(res.status).toBe(409);
    });
});

// ---------------------------------------------------------------------------
// GET /api/loans/:loanId
// ---------------------------------------------------------------------------
describe("GET /api/loans/:loanId", () => {
    it("returns the loan", async () => {
        mockGetLoanById.mockResolvedValue(sampleLoan);

        const res = await request(app).get(`/api/loans/${LOAN_ID}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(sampleLoan);
    });

    it("returns 404 when loan does not exist", async () => {
        mockGetLoanById.mockResolvedValue(null);

        const res = await request(app).get(`/api/loans/${LOAN_ID}`);

        expect(res.status).toBe(404);
    });

    it("returns 400 for an invalid loanId UUID", async () => {
        const res = await request(app).get("/api/loans/not-a-uuid");

        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// GET /api/loans/user/:userId
// ---------------------------------------------------------------------------
describe("GET /api/loans/user/:userId", () => {
    it("returns all loans for a user", async () => {
        mockGetLoansByUserId.mockResolvedValue([sampleLoan]);

        const res = await request(app).get(`/api/loans/user/${USER_ID}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].userId).toBe(USER_ID);
    });

    it("returns an empty array when user has no loans", async () => {
        mockGetLoansByUserId.mockResolvedValue([]);

        const res = await request(app).get(`/api/loans/user/${USER_ID}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("returns 400 for an invalid userId UUID", async () => {
        const res = await request(app).get("/api/loans/user/not-a-uuid");

        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// GET /api/loans/copy/:copyId
// ---------------------------------------------------------------------------
describe("GET /api/loans/copy/:copyId", () => {
    it("returns the loan history for a copy", async () => {
        mockGetLoansByCopyId.mockResolvedValue([sampleLoan]);

        const res = await request(app).get(`/api/loans/copy/${COPY_ID}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].copyId).toBe(COPY_ID);
    });

    it("returns an empty array when copy has no loans", async () => {
        mockGetLoansByCopyId.mockResolvedValue([]);

        const res = await request(app).get(`/api/loans/copy/${COPY_ID}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("returns 400 for an invalid copyId UUID", async () => {
        const res = await request(app).get("/api/loans/copy/not-a-uuid");

        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// PATCH /api/loans/:loanId/return
// ---------------------------------------------------------------------------
describe("PATCH /api/loans/:loanId/return", () => {
    it("returns the loan and transitions the next hold to READY", async () => {
        const returnedLoan = { ...sampleLoan, returnedAt: "2026-04-02T12:00:00.000Z" };
        mockGetLoanById.mockResolvedValue(sampleLoan);
        mockReturnLoan.mockResolvedValue(returnedLoan);
        mockGetCopyById.mockResolvedValue(sampleCopy);
        mockGetNextHoldInQueue.mockResolvedValue(sampleHold);
        mockUpdateHoldStatus.mockResolvedValue({ ...sampleHold, status: "READY" });

        const res = await request(app).patch(`/api/loans/${LOAN_ID}/return`);

        expect(res.status).toBe(200);
        expect(res.body.returnedAt).not.toBeNull();
        expect(mockUpdateHoldStatus).toHaveBeenCalledWith(HOLD_ID, expect.objectContaining({ status: "READY" }));
    });

    it("returns the loan without transitioning a hold when queue is empty", async () => {
        const returnedLoan = { ...sampleLoan, returnedAt: "2026-04-02T12:00:00.000Z" };
        mockGetLoanById.mockResolvedValue(sampleLoan);
        mockReturnLoan.mockResolvedValue(returnedLoan);
        mockGetCopyById.mockResolvedValue(sampleCopy);
        mockGetNextHoldInQueue.mockResolvedValue(null);

        const res = await request(app).patch(`/api/loans/${LOAN_ID}/return`);

        expect(res.status).toBe(200);
        expect(mockUpdateHoldStatus).not.toHaveBeenCalled();
    });

    it("returns 404 when loan does not exist", async () => {
        mockGetLoanById.mockResolvedValue(null);

        const res = await request(app).patch(`/api/loans/${LOAN_ID}/return`);

        expect(res.status).toBe(404);
    });

    it("returns 409 when loan is already returned", async () => {
        mockGetLoanById.mockResolvedValue({ ...sampleLoan, returnedAt: "2026-04-01T00:00:00.000Z" });

        const res = await request(app).patch(`/api/loans/${LOAN_ID}/return`);

        expect(res.status).toBe(409);
    });

    it("returns 400 for an invalid loanId UUID", async () => {
        const res = await request(app).patch("/api/loans/not-a-uuid/return");

        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// PATCH /api/loans/:loanId/renew
// ---------------------------------------------------------------------------
describe("PATCH /api/loans/:loanId/renew", () => {
    it("renews the loan with an extended due date", async () => {
        const newDueAt = "2026-04-30T00:00:00.000Z";
        const renewedLoan = { ...sampleLoan, dueAt: newDueAt, renewalCount: 1 };
        mockGetLoanById.mockResolvedValue(sampleLoan);
        mockRenewLoan.mockResolvedValue(renewedLoan);

        const res = await request(app)
            .patch(`/api/loans/${LOAN_ID}/renew`)
            .send({ dueAt: newDueAt });

        expect(res.status).toBe(200);
        expect(res.body.dueAt).toBe(newDueAt);
        expect(res.body.renewalCount).toBe(1);
    });

    it("returns 400 when dueAt is missing", async () => {
        const res = await request(app)
            .patch(`/api/loans/${LOAN_ID}/renew`)
            .send({});

        expect(res.status).toBe(400);
    });

    it("returns 400 when dueAt is not a valid date string", async () => {
        const res = await request(app)
            .patch(`/api/loans/${LOAN_ID}/renew`)
            .send({ dueAt: "not-a-date" });

        expect(res.status).toBe(400);
    });

    it("returns 404 when loan does not exist", async () => {
        mockGetLoanById.mockResolvedValue(null);

        const res = await request(app)
            .patch(`/api/loans/${LOAN_ID}/renew`)
            .send({ dueAt: "2026-04-30T00:00:00.000Z" });

        expect(res.status).toBe(404);
    });

    it("returns 409 when loan has already been returned", async () => {
        mockGetLoanById.mockResolvedValue({ ...sampleLoan, returnedAt: "2026-04-01T00:00:00.000Z" });

        const res = await request(app)
            .patch(`/api/loans/${LOAN_ID}/renew`)
            .send({ dueAt: "2026-04-30T00:00:00.000Z" });

        expect(res.status).toBe(409);
    });

    it("returns 400 for an invalid loanId UUID", async () => {
        const res = await request(app)
            .patch("/api/loans/not-a-uuid/renew")
            .send({ dueAt: "2026-04-30T00:00:00.000Z" });

        expect(res.status).toBe(400);
    });
});
