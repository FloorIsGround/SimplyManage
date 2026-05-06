import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

vi.mock("../models/billing/billingQueries.js", () => ({
    createReceiptForFees: vi.fn(),
    getAssessedFeesByIdsForUser: vi.fn(),
    getFeesByUserId: vi.fn(),
    getOutstandingFeesByUserId: vi.fn(),
}));

vi.mock("../models/user/userQueries.js", () => ({
    getUserById: vi.fn(),
}));

vi.mock("../services/billing_settings.js", () => ({
    getOverdueFeeCentsPerDay: vi.fn(),
    setOverdueFeeCentsPerDay: vi.fn(),
}));

vi.mock("../services/receipt_service.js", () => ({
    createReceiptDocument: vi.fn(),
    FILING_DEFAULTS: {
        issuedBy: "SimplyManage Library",
        currency: "$",
    },
}));

import { createReceiptForFees, getAssessedFeesByIdsForUser, getFeesByUserId, getOutstandingFeesByUserId } from "../models/billing/billingQueries.js";
import { getUserById } from "../models/user/userQueries.js";
import { getOverdueFeeCentsPerDay, setOverdueFeeCentsPerDay } from "../services/billing_settings.js";
import { createReceiptDocument } from "../services/receipt_service.js";

const mockCreateReceiptForFees = vi.mocked(createReceiptForFees);
const mockGetAssessedFeesByIdsForUser = vi.mocked(getAssessedFeesByIdsForUser);
const mockGetFeesByUserId = vi.mocked(getFeesByUserId);
const mockGetOutstandingFeesByUserId = vi.mocked(getOutstandingFeesByUserId);
const mockGetUserById = vi.mocked(getUserById);
const mockGetOverdueFeeCentsPerDay = vi.mocked(getOverdueFeeCentsPerDay);
const mockSetOverdueFeeCentsPerDay = vi.mocked(setOverdueFeeCentsPerDay);
const mockCreateReceiptDocument = vi.mocked(createReceiptDocument);

const app = createApp();

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const FEE_ID = "223e4567-e89b-12d3-a456-426614174001";
const SECOND_FEE_ID = "223e4567-e89b-12d3-a456-426614174099";
const RECEIPT_ID = "523e4567-e89b-12d3-a456-426614174004";
const LOAN_ID = "323e4567-e89b-12d3-a456-426614174002";

const sampleFee = {
    id: FEE_ID,
    userId: USER_ID,
    loanId: LOAN_ID,
    amountCents: 75,
    reason: "OVERDUE" as const,
    status: "ASSESSED" as const,
    assessedAt: "2026-05-01T00:00:00.000Z",
    bookTitle: "Test Book",
};

const secondSampleFee = {
    ...sampleFee,
    id: SECOND_FEE_ID,
    amountCents: 125,
    bookTitle: "Another Book",
};

const sampleUser = {
    id: USER_ID,
    email: "patron@example.com",
    firstName: "Carol",
    lastName: "Patron",
    libraryCardNumber: "12345678",
    role: "PATRON" as const,
    status: "ACTIVE" as const,
    createdAt: "2026-01-01T00:00:00.000Z",
};

const sampleReceipt = {
    id: RECEIPT_ID,
    userId: USER_ID,
    amountCents: 200,
    externalReceiptId: "a1b2c3d4-e5f6-7890-abcd-000000000002",
    externalTransactionId: "REC-2026-0001",
    paymentMethod: "MANUAL" as const,
    note: "Paid at circulation desk",
    paidAt: "2026-05-04T00:00:00.000Z",
    createdAt: "2026-05-04T00:00:00.000Z",
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("GET /api/billing/users/:userId/fees", () => {
    it("returns outstanding assessed fees by default", async () => {
        mockGetOutstandingFeesByUserId.mockResolvedValue([sampleFee]);

        const res = await request(app).get(`/api/billing/users/${USER_ID}/fees`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([sampleFee]);
        expect(mockGetOutstandingFeesByUserId).toHaveBeenCalledWith(USER_ID);
        expect(mockGetFeesByUserId).not.toHaveBeenCalled();
    });

    it("returns fees filtered by a valid status", async () => {
        const paidFee = { ...sampleFee, status: "PAID" as const };
        mockGetFeesByUserId.mockResolvedValue([paidFee]);

        const res = await request(app).get(`/api/billing/users/${USER_ID}/fees?status=PAID`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([paidFee]);
        expect(mockGetFeesByUserId).toHaveBeenCalledWith(USER_ID, "PAID");
        expect(mockGetOutstandingFeesByUserId).not.toHaveBeenCalled();
    });

    it("returns 400 for an invalid userId", async () => {
        const res = await request(app).get("/api/billing/users/not-a-uuid/fees");

        expect(res.status).toBe(400);
        expect(mockGetOutstandingFeesByUserId).not.toHaveBeenCalled();
    });

    it("returns 400 for an invalid status", async () => {
        const res = await request(app).get(`/api/billing/users/${USER_ID}/fees?status=OPEN`);

        expect(res.status).toBe(400);
        expect(mockGetFeesByUserId).not.toHaveBeenCalled();
        expect(mockGetOutstandingFeesByUserId).not.toHaveBeenCalled();
    });
});

describe("POST /api/billing/users/:userId/receipts", () => {
    it("creates a manual receipt for selected assessed fees", async () => {
        mockGetAssessedFeesByIdsForUser.mockResolvedValue([sampleFee, secondSampleFee]);
        mockGetUserById.mockResolvedValue(sampleUser);
        mockCreateReceiptDocument.mockResolvedValue({
            id: "a1b2c3d4-e5f6-7890-abcd-000000000002",
            transactionId: "REC-2026-0001",
        });
        mockCreateReceiptForFees.mockResolvedValue(sampleReceipt);

        const res = await request(app)
            .post(`/api/billing/users/${USER_ID}/receipts`)
            .send({
                feeIds: [FEE_ID, SECOND_FEE_ID],
                paymentMethod: "MANUAL",
                note: "Paid at circulation desk",
            });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            receipt: sampleReceipt,
            receiptPdfUrl: `/api/billing/receipts/${RECEIPT_ID}/pdf`,
        });
        expect(mockGetAssessedFeesByIdsForUser).toHaveBeenCalledWith(USER_ID, [FEE_ID, SECOND_FEE_ID]);
        expect(mockGetUserById).toHaveBeenCalledWith(USER_ID);
        expect(mockCreateReceiptDocument).toHaveBeenCalledWith({
            issued_by: "SimplyManage Library",
            issued_to: {
                entity_name: "Carol Patron",
                representative: "patron@example.com",
                location: "Library card 12345678",
            },
            paid_date: expect.any(String),
            currency: "$",
            items: [{ description: "Payment for overdue library fees", quantity: 1, unit_price: 2 }],
        });
        expect(mockCreateReceiptForFees).toHaveBeenCalledWith(expect.objectContaining({
            userId: USER_ID,
            amountCents: 200,
            externalReceiptId: "a1b2c3d4-e5f6-7890-abcd-000000000002",
            externalTransactionId: "REC-2026-0001",
            paymentMethod: "MANUAL",
            note: "Paid at circulation desk",
            fees: [
                { feeId: FEE_ID, amountCents: 75 },
                { feeId: SECOND_FEE_ID, amountCents: 125 },
            ],
        }));
    });

    it("returns 400 when feeIds is empty", async () => {
        const res = await request(app)
            .post(`/api/billing/users/${USER_ID}/receipts`)
            .send({ feeIds: [] });

        expect(res.status).toBe(400);
        expect(mockCreateReceiptDocument).not.toHaveBeenCalled();
        expect(mockCreateReceiptForFees).not.toHaveBeenCalled();
    });

    it("returns 409 when a requested fee is missing or not assessed", async () => {
        mockGetAssessedFeesByIdsForUser.mockResolvedValue([sampleFee]);

        const res = await request(app)
            .post(`/api/billing/users/${USER_ID}/receipts`)
            .send({ feeIds: [FEE_ID, SECOND_FEE_ID] });

        expect(res.status).toBe(409);
        expect(mockCreateReceiptDocument).not.toHaveBeenCalled();
        expect(mockCreateReceiptForFees).not.toHaveBeenCalled();
    });

    it("returns 400 for an invalid feeId", async () => {
        const res = await request(app)
            .post(`/api/billing/users/${USER_ID}/receipts`)
            .send({ feeIds: ["not-a-uuid"] });

        expect(res.status).toBe(400);
        expect(mockGetAssessedFeesByIdsForUser).not.toHaveBeenCalled();
    });
});

describe("GET /api/billing/settings/overdue-fee-rate", () => {
    it("returns the active overdue cents-per-day setting", async () => {
        mockGetOverdueFeeCentsPerDay.mockReturnValue(25);

        const res = await request(app).get("/api/billing/settings/overdue-fee-rate");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ centsPerDay: 25 });
    });
});

describe("PATCH /api/billing/settings/overdue-fee-rate", () => {
    it("updates and returns the active overdue cents-per-day setting", async () => {
        mockSetOverdueFeeCentsPerDay.mockReturnValue(50);

        const res = await request(app)
            .patch("/api/billing/settings/overdue-fee-rate")
            .send({ centsPerDay: 50 });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ centsPerDay: 50 });
        expect(mockSetOverdueFeeCentsPerDay).toHaveBeenCalledWith(50);
    });

    it("returns 400 when centsPerDay is negative", async () => {
        const res = await request(app)
            .patch("/api/billing/settings/overdue-fee-rate")
            .send({ centsPerDay: -1 });

        expect(res.status).toBe(400);
        expect(mockSetOverdueFeeCentsPerDay).not.toHaveBeenCalled();
    });

    it("returns 400 when centsPerDay is not an integer", async () => {
        const res = await request(app)
            .patch("/api/billing/settings/overdue-fee-rate")
            .send({ centsPerDay: 10.5 });

        expect(res.status).toBe(400);
        expect(mockSetOverdueFeeCentsPerDay).not.toHaveBeenCalled();
    });
});
