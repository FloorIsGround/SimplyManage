import type { NextFunction, Request, Response } from "express";
import { createHttpError, getSingleValue, isUuid, requireUuid } from "./controllerHelpers.js";
import { createReceiptForFees, getAssessedFeesByIdsForUser, getFeesByUserId, getOutstandingFeesByUserId, getReceiptById } from "../models/billing/billingQueries.js";
import { FEE_STATUSES, PAYMENT_METHODS, type FeeStatus, type PaymentMethod } from "../models/billing/billing.js";
import { getUserById } from "../models/user/userQueries.js";
import { getOverdueFeeCentsPerDay, setOverdueFeeCentsPerDay } from "../services/billing_settings.js";
import { createReceiptDocument, fetchReceiptPdf, FILING_DEFAULTS } from "../services/receipt_service.js";

function parseFeeStatus(value: unknown): FeeStatus | null {
    const status = getSingleValue(value);
    if (!status) return null;
    return (FEE_STATUSES as readonly string[]).includes(status) ? status as FeeStatus : null;
}

function parsePaymentMethod(value: unknown): PaymentMethod {
    const method = getSingleValue(value) ?? "MANUAL";
    if (!(PAYMENT_METHODS as readonly string[]).includes(method)) {
        throw createHttpError(400, "paymentMethod must be one of CASH, CARD, CHECK, ONLINE, MANUAL, or OTHER.");
    }
    return method as PaymentMethod;
}

function parseFeeIds(value: unknown): string[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw createHttpError(400, "feeIds must be a non-empty array of UUIDs.");
    }

    const feeIds = value.map((feeId) => {
        if (typeof feeId !== "string" || !isUuid(feeId)) {
            throw createHttpError(400, "feeIds must contain only valid UUIDs.");
        }
        return feeId;
    });

    return Array.from(new Set(feeIds));
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

export async function createUserReceipt(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = requireUuid(req.params.userId, "userId");
        const feeIds = parseFeeIds(req.body.feeIds);
        const paymentMethod = parsePaymentMethod(req.body.paymentMethod);
        const note = typeof req.body.note === "string" && req.body.note.trim() !== "" ? req.body.note.trim() : null;

        const fees = await getAssessedFeesByIdsForUser(userId, feeIds);
        if (fees.length !== feeIds.length) {
            throw createHttpError(409, "One or more requested fees are missing, not assessed, or do not belong to this user.");
        }

        const user = await getUserById(userId);
        if (!user) {
            throw createHttpError(404, "User not found.");
        }

        const amountCents = fees.reduce((sum, fee) => sum + fee.amountCents, 0);
        const paidAt = new Date().toISOString();
        const filingReceipt = await createReceiptDocument({
            issued_by: FILING_DEFAULTS.issuedBy,
            issued_to: {
                entity_name: `${user.firstName} ${user.lastName}`,
                representative: user.email,
                location: `Library card ${user.libraryCardNumber}`,
            },
            paid_date: paidAt,
            currency: FILING_DEFAULTS.currency,
            items: [{
                description: "Payment for overdue library fees",
                quantity: 1,
                unit_price: amountCents / 100,
            }],
        });

        const receipt = await createReceiptForFees({
            userId,
            amountCents,
            externalReceiptId: filingReceipt.id,
            externalTransactionId: filingReceipt.transactionId,
            paymentMethod,
            note,
            paidAt,
            fees: fees.map((fee) => ({ feeId: fee.id, amountCents: fee.amountCents })),
        });

        return res.status(201).json({
            receipt,
            receiptPdfUrl: `/api/billing/receipts/${receipt.id}/pdf`,
        });
    } catch (err) {
        next(err);
    }
}

export async function getReceiptPdf(req: Request, res: Response, next: NextFunction) {
    try {
        const receiptId = requireUuid(req.params.receiptId, "receiptId");
        const receipt = await getReceiptById(receiptId);
        if (!receipt) {
            throw createHttpError(404, "Receipt not found.");
        }

        const pdf = await fetchReceiptPdf(receipt.externalReceiptId);
        const filenameId = receipt.externalTransactionId || receipt.id;
        res.setHeader("Content-Type", pdf.contentType || "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="receipt-${filenameId}.pdf"`);
        return res.send(pdf.content);
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
