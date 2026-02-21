export interface Hold {
  id: number;                 // Unique ID for this hold/reservation
  userId: number;             // ID of the user who placed the hold
  bookId: number;             // ID of the book being held
  placedAt: Date;      // Date the hold was created
  readyExpiresAt: Date;       // Date the hold expires if not picked up
  status: HoldStatus;         // Current state of the hold
}

// Possible statuses for a hold/reservation
export enum HoldStatus {
  active,     // Hold is currently active and waiting to be fulfilled
  expired,    // Hold expired before the user picked up the book
  fulfilled,  // Hold was successfully completed and the book was picked up
  cancelled   // Hold was cancelled by the user or librarian
}

