export interface Loan {
  id: string;               // Unique ID for this borrow transaction
  userId: string;           // ID of the user who borrowed the book
  copyId: string;           // ID of the borrowed book
  checkoutAt: Date;         // Date the book was checked out
  dueAt: Date;              // Date the book is due back
  returnedAt: Date | null;  // Date the book was returned
  renewalCount: number;
  status: LoanStatus;       // Current state of the loan
}

// Possible statuses for a borrow transaction
export enum LoanStatus {
borrowed,
returned,
overdue
}