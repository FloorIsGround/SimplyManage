export const FEE_REASONS = ["OVERDUE"] as const;
export type FeeReason = typeof FEE_REASONS[number];

export const FEE_STATUSES = ["ASSESSED", "WAIVED", "PAID"] as const;
export type FeeStatus = typeof FEE_STATUSES[number];

export const PAYMENT_METHODS = ["CASH", "CARD", "CHECK", "ONLINE", "MANUAL", "OTHER"] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export interface Fee {
    id: string;
    userId: string;
    loanId: string | null;
    amountCents: number;
    reason: FeeReason;
    status: FeeStatus;
    assessedAt: string;
    bookTitle?: string;
}

export interface CreateFeeInput {
    userId: string;
    loanId?: string | null;
    amountCents: number;
    reason: FeeReason;
    status?: FeeStatus;
    assessedAt?: string;
}

export interface Receipt {
    id: string;
    userId: string;
    amountCents: number;
    externalReceiptId: string;
    externalTransactionId: string | null;
    paymentMethod: PaymentMethod;
    note: string | null;
    paidAt: string;
    createdAt: string;
}

export interface ReceiptFeeInput {
    feeId: string;
    amountCents: number;
}

export interface CreateReceiptForFeesInput {
    userId: string;
    amountCents: number;
    externalReceiptId: string;
    externalTransactionId?: string | null;
    paymentMethod?: PaymentMethod;
    note?: string | null;
    paidAt?: string;
    fees: ReceiptFeeInput[];
}
