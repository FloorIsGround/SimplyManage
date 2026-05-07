import { describe, expect, it } from "vitest";
import { calculateDaysOverdue, calculateOverdueFeeCents } from "../models/billing/overdueFee.js";

describe("overdue fee calculation", () => {
    it("returns 0 days and 0 cents when returned before due date", () => {
        const dueAt = "2026-05-10T12:00:00.000Z";
        const returnedAt = "2026-05-10T11:59:00.000Z";

        expect(calculateDaysOverdue(dueAt, returnedAt)).toBe(0);
        expect(calculateOverdueFeeCents(dueAt, returnedAt, 25)).toBe(0);
    });

    it("returns 0 days and 0 cents when returned exactly at due date", () => {
        const dueAt = "2026-05-10T12:00:00.000Z";
        const returnedAt = "2026-05-10T12:00:00.000Z";

        expect(calculateDaysOverdue(dueAt, returnedAt)).toBe(0);
        expect(calculateOverdueFeeCents(dueAt, returnedAt, 25)).toBe(0);
    });

    it("rounds partial overdue days up to one day", () => {
        const dueAt = "2026-05-10T12:00:00.000Z";
        const returnedAt = "2026-05-10T12:01:00.000Z";

        expect(calculateDaysOverdue(dueAt, returnedAt)).toBe(1);
        expect(calculateOverdueFeeCents(dueAt, returnedAt, 25)).toBe(25);
    });

    it("calculates F = d * r for multiple overdue days", () => {
        const dueAt = "2026-05-10T00:00:00.000Z";
        const returnedAt = "2026-05-13T00:00:00.000Z";

        expect(calculateDaysOverdue(dueAt, returnedAt)).toBe(3);
        expect(calculateOverdueFeeCents(dueAt, returnedAt, 25)).toBe(75);
    });

    it("rejects a negative daily rate", () => {
        expect(() => calculateOverdueFeeCents("2026-05-10T00:00:00.000Z", "2026-05-11T00:00:00.000Z", -1)).toThrow(
            "feeCentsPerDay must be a nonnegative integer."
        );
    });

    it("rejects invalid date strings", () => {
        expect(() => calculateDaysOverdue("not-a-date", "2026-05-11T00:00:00.000Z")).toThrow(
            "dueAt must be a valid date string."
        );
        expect(() => calculateDaysOverdue("2026-05-10T00:00:00.000Z", "not-a-date")).toThrow(
            "returnedAt must be a valid date string."
        );
    });
});
