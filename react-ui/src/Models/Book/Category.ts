import type { Book } from "./Book";

export interface Category {
  id: number;           // Unique identifier for the category/genre
  name: string;         // Name of the category (e.g., Fiction, History)
  description: string;  // Short explanation of what this category includes
  books: Book[];      // Array of book IDs that belong to this category
}
