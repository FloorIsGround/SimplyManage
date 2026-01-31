export interface User {
  id: number;                     // Unique identifier for the user
  name: string;                   // Full name of the user
  email: string;                  // User's email address
  password: string;               // Hashed password 
  role: Role;                     // User's system role
  membership: Membership;         // User's membership level
  borrowedBooks: number[];        // Array of book or borrow IDs currently checked out
}

// Possible system roles a user can have within the application
export enum Role {
  admin,      // Full administrative access to manage users, books, and system settings
  librarian,  // Library staff with permissions to manage books, loans, and holds
  patron      // Regular user who can borrow books, place holds, and leave reviews
}

// Possible membership levels for a library user
export enum Membership {
  standard,   // Basic access with standard borrowing limits
  premium,    // Higher limits and extended borrowing privileges
  staff       // Internal use for employees (optional)
}
