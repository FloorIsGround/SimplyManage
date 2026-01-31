export interface Book {
  id: string;               // Unique identifier for the book 
  title: string;            // Title of the book
  authorId: number;         // ID of the author who wrote the book
  categoryId: number;       // ID of the category/genre this book belongs to
  publicationYear: number;  // Year the book was published
  publisher: string;        // Name of the publishing company
  copiesAvailable: number;  // Number of copies currently available for borrowing
  totalCopies: number;      // Total number of copies the library owns
  holds: number;            // Number of active holds placed on this book

  reviews: {
    userId: number;         // ID of the user who left the review
    rating: number;         // Rating value (e.g., 1–5 stars)
    comment: string;        // Review text
    date: string;           // Date the review was submitted
  }[];                      // Array of review objects
}
