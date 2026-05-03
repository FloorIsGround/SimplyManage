import type { Book } from "../Book/Book";

export interface User {
  id: string;                     // Unique identifier for the user
  email: string;                  // User's email address
  firstName: string;
  lastName: string;
  dateOfBirth?: string;          // User's date of birth
  password: string;               // Hashed password 
  role: Role;                     // User's system role
  status: UserStatus;
  createdAt: Date;
  borrowedBooks: Book[];          // Array of books currently checked out
  cardNumber?: string;            // Library card number assigned to the user
}

// Possible system roles a user can have within the application
export enum Role {
  admin,      // Full administrative access to manage users, books, and system settings
  librarian,  // Library staff with permissions to manage books, loans, and holds
  patron      // Regular user who can borrow books, place holds, and leave reviews
}

export enum UserStatus {
  active,     // Hold is currently active and waiting to be fulfilled
  suspended
}
