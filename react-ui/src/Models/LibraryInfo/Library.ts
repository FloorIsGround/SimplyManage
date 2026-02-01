import type { Book } from "../Book/Book";

export interface Library {
  id: number;          // Unique identifier for the library branch
  name: string;        // Name of the library
  address: string;     // Physical address of the library
  phoneNumber: string; // Contact phone number for the library
  books: Book[];     // Array of books available at this library
}

