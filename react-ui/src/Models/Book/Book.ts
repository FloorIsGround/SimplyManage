export interface Book {
  id: string;               // Unique identifier for the book 
  isbn: number;
  title: string;            // Title of the book
  author: string;         // ID of the author who wrote the book
  genre: string;       // ID of the category/genre this book belongs to
  description: string;
  publicationYear: number;  // Year the book was published
  createdAt: Date;
  averageRating: number;
  reviews: Review[];        // Array of review objects
}

export interface Review {
  id: number;             // Unique ID for this review
  userId: number;     // ID of the user who wrote the review
  bookId: number;     // ID of the book being reviewed
  rating: number;     // Rating value (e.g., 1–5 stars)
  comment: string;    // Written review text
  createdAt: Date;    // Timestamp when the review was created
}