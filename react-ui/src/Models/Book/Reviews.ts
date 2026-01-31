export interface Reviews {
  id: number;         // Unique ID for this review
  userId: number;     // ID of the user who wrote the review
  bookId: number;     // ID of the book being reviewed
  rating: number;     // Rating value (e.g., 1–5 stars)
  comment: string;    // Written review text
  createdAt: Date;    // Timestamp when the review was created
}
