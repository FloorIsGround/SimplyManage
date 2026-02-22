export interface Loan {
  id: number;               // Unique ID for this borrow transaction
  userId: number;           // ID of the user who borrowed the book
  copyId: number;           // ID of the borrowed book
  checkoutAt: Date;         // Date the book was checked out
  dueAt: Date;            // Date the book is due back
  returnedAt: Date | null;  // Date the book was returned (null if not returned)
  renewalCount: Date;
  status: LoanStatus;     // Current state of the loan
}

// Possible statuses for a borrow transaction
export enum LoanStatus {
borrowed,
returned,
overdue
}