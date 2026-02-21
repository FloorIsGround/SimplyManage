export interface Fee {
  id: number;         // Unique identifier for the payment record
  userId: number;     // ID of the user who made the payment
  loanId: number;   // ID of the related borrow/loan transaction
  amountCents: number;     // Payment amount in dollars
  reason: FeeReason;
  status: Status;      // Whether the payment has been completed
  assessedAt: Date;   // Date the payment was issued or created
}

export enum FeeReason {
  overdue,     // Hold is currently active and waiting to be fulfilled
  lost,
  damaged,
  manual
}

export enum Status {
  assessed,
  waived,
  paid
}
