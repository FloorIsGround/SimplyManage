import { describe, it, expect, beforeEach } from "vitest";
import {
    getOverdueFeeCentsPerDay,
    setOverdueFeeCentsPerDay,
    parseInitialOverdueFeeRate,
    DEFAULT_OVERDUE_FEE_CENTS_PER_DAY,
} from "../services/billing_settings.js";

describe("billing_settings", () => {
    beforeEach(() => {
        // Reset to default before each test to avoid cross-test pollution
        setOverdueFeeCentsPerDay(DEFAULT_OVERDUE_FEE_CENTS_PER_DAY);
    });

    describe("parseInitialOverdueFeeRate", () => {
        it("defaults to 25 when env is missing", () => {
            expect(parseInitialOverdueFeeRate(undefined)).toBe(DEFAULT_OVERDUE_FEE_CENTS_PER_DAY);
        });

        it("defaults to 25 when env is empty string", () => {
            expect(parseInitialOverdueFeeRate("")).toBe(DEFAULT_OVERDUE_FEE_CENTS_PER_DAY);
        });

        it("defaults to 25 when env value is not a number", () => {
            expect(parseInitialOverdueFeeRate("abc")).toBe(DEFAULT_OVERDUE_FEE_CENTS_PER_DAY);
        });

        it("defaults to 25 when env value is negative", () => {
            expect(parseInitialOverdueFeeRate("-5")).toBe(DEFAULT_OVERDUE_FEE_CENTS_PER_DAY);
        });

        it("uses a nonnegative integer env value", () => {
            expect(parseInitialOverdueFeeRate("50")).toBe(50);
        });
    });

    describe("getOverdueFeeCentsPerDay", () => {
        it("returns the current overdue fee rate", () => {
            expect(getOverdueFeeCentsPerDay()).toBe(DEFAULT_OVERDUE_FEE_CENTS_PER_DAY);
        });
    });

    describe("setOverdueFeeCentsPerDay", () => {
        it("updates the fee and getter returns the new value", () => {
            const result = setOverdueFeeCentsPerDay(50);
            expect(result).toBe(50);
            expect(getOverdueFeeCentsPerDay()).toBe(50);
        });

        it("can set to zero", () => {
            const result = setOverdueFeeCentsPerDay(0);
            expect(result).toBe(0);
            expect(getOverdueFeeCentsPerDay()).toBe(0);
        });

        it("throws for negative values", () => {
            expect(() => setOverdueFeeCentsPerDay(-1)).toThrow(
                "overdueFeeCentsPerDay must be a nonnegative integer."
            );
        });

        it("throws for non-integer values (float)", () => {
            expect(() => setOverdueFeeCentsPerDay(10.5)).toThrow(
                "overdueFeeCentsPerDay must be a nonnegative integer."
            );
        });

        it("throws for non-integer values (string)", () => {
            expect(() => setOverdueFeeCentsPerDay("25" as unknown as number)).toThrow(
                "overdueFeeCentsPerDay must be a nonnegative integer."
            );
        });

        it("throws for NaN", () => {
            expect(() => setOverdueFeeCentsPerDay(NaN)).toThrow(
                "overdueFeeCentsPerDay must be a nonnegative integer."
            );
        });
    });
});
