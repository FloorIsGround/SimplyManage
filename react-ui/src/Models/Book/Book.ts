export interface Book {
  id: string;
  isbn: number;
  title: string;
  author: string;
  genre: string | null;
  description: string | null;
  publicationYear: number | null;
  createdAt: string;
  averageRating: number;
  audience: string;
  reviews: Review[];
}

export interface Review {
  id: number;
  userId: string;
  bookId: string;
  rating: number;
  comment: string;
  createdAt: string;
}