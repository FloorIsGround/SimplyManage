import type { NextFunction, Request, Response } from "express";
import { createHttpError, getSingleValue, requireUuid } from "./controllerHelpers.js";
import { getFeesByUserId, getOutstandingFeesByUserId } from "../models/billing/billingQueries.js";
import { FEE_STATUSES, type FeeStatus } from "../models/billing/billing.js";
import { getOverdueFeeCentsPerDay, setOverdueFeeCentsPerDay } from "../services/billing_settings.js";

function parseFeeStatus(value: unknown): FeeStatus | null {
    const status = getSingleValue(value);
    if (!status) return null;
    return (FEE_STATUSES as readonly string[]).includes(status) ? status as FeeStatus : null;
}

export async function getUserFees(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = requireUuid(req.params.userId, "userId");
        const rawStatus = getSingleValue(req.query.status);

        if (!rawStatus) {
            const fees = await getOutstandingFeesByUserId(userId);
            return res.json(fees);
        }

        const status = parseFeeStatus(rawStatus);
        if (!status) {
            throw createHttpError(400, "status must be one of ASSESSED, WAIVED, or PAID.");
        }

        const fees = await getFeesByUserId(userId, status);
        return res.json(fees);
    } catch (err) {
        next(err);
    }
}

export async function getOverdueFeeRate(_req: Request, res: Response, next: NextFunction) {
    try {
        return res.json({ centsPerDay: getOverdueFeeCentsPerDay() });
    } catch (err) {
        next(err);
    }
}

export async function patchOverdueFeeRate(req: Request, res: Response, next: NextFunction) {
    try {
        const { centsPerDay } = req.body;
        if (!Number.isInteger(centsPerDay) || centsPerDay < 0) {
            throw createHttpError(400, "centsPerDay must be a nonnegative integer.");
        }

        const updated = setOverdueFeeCentsPerDay(centsPerDay);
        return res.json({ centsPerDay: updated });
    } catch (err) {
        next(err);
    }
}
