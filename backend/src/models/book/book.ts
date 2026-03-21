import type { Review } from "../review/review.js";

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