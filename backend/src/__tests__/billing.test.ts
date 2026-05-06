import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

vi.mock("../models/billing/billingQueries.js", () => ({
    getFeesByUserId: vi.fn(),
    getOutstandingFeesByUserId: vi.fn(),
}));

vi.mock("../services/billing_settings.js", () => ({
    getOverdueFeeCentsPerDay: vi.fn(),
    setOverdueFeeCentsPerDay: vi.fn(),
}));

import { getFeesByUserId, getOutstandingFeesByUserId } from "../models/billing/billingQueries.js";
import { getOverdueFeeCentsPerDay, setOverdueFeeCentsPerDay } from "../services/billing_settings.js";

const mockGetFeesByUserId = vi.mocked(getFeesByUserId);
const mockGetOutstandingFeesByUserId = vi.mocked(getOutstandingFeesByUserId);
const mockGetOverdueFeeCentsPerDay = vi.mocked(getOverdueFeeCentsPerDay);
const mockSetOverdueFeeCentsPerDay = vi.mocked(setOverdueFeeCentsPerDay);

const app = createApp();

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const FEE_ID = "223e4567-e89b-12d3-a456-426614174001";
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
