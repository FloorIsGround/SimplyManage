export interface Loan {
  id: number;               // Unique ID for this borrow transaction
  userId: number;           // ID of the user who borrowed the book
  bookId: number;           // ID of the borrowed book
  borrowDate: Date;         // Date the book was checked out
  dueDate: Date;            // Date the book is due back
  returnDate: Date | null;  // Date the book was returned (null if not returned)
  status: LoanStatus;     // Current state of the loan
}

// Possible statuses for a borrow transaction
export enum LoanStatus {
borrowed,
returned,
overdue
}