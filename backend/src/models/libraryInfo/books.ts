export interface Book {
  id: string;
  isbn: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  publicationYear: number;
  createdAt: string;
  averageRating: number;
  audience: string;
}

export interface Review {
  id: number;
  userId: string;
  bookId: string;
  rating: number;
  comment: string;
  createdAt: string;
}