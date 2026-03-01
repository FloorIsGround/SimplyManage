export interface Book {
  id: string;
  isbn: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  publicationYear: number;
  createdAt: Date;
  averageRating: number;
  reviews: Review[];
}

export interface Review {
  id: number;         // Unique ID for this review
  userId: number;     // ID of the user who wrote the review
  bookId: number;     // ID of the book being reviewed
  rating: number;     // Rating value (e.g., 1–5 stars)
  comment: string;    // Written review text
  createdAt: Date;    // Timestamp when the review was created
}