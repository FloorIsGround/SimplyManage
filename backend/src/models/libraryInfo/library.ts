import type { Book } from "../book/book.js";


export interface Library {
  id: number;          // Unique identifier for the library branch
  name: string;        // Name of the library
  address: string;     // Physical address of the library
  phoneNumber: string; // Contact phone number for the library
  books: Book[];       // Array of books available at this library
  hours: Hours[];      // Array of hours objects for each day
}


export interface Hours {
  day: string;
  open: string;
  close: string;
}

