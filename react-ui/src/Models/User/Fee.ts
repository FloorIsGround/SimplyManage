export type FeeReason = "OVERDUE";

export type FeeStatus = "ASSESSED" | "WAIVED" | "PAID";

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
