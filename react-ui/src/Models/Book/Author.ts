import type { Book } from "./Book";

export interface Author {
  id: number;          // Unique identifier for the author
  name: string;        // Full name of the author
  bio: string;         // Short biography or description of the author
  birthDate: Date;     // Author's date of birth
  books: Book[];     // Array of books written by this author
}
