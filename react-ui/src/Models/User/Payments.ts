export interface Payments {
  id: number;         // Unique identifier for the payment record
  userId: number;     // ID of the user who made the payment
  borrowId: number;   // ID of the related borrow/loan transaction
  amount: number;     // Payment amount in dollars
  paid: boolean;      // Whether the payment has been completed
  issuedDate: Date;   // Date the payment was issued or created
  paidDate?: Date;    // Date the payment was actually paid (optional)
}


