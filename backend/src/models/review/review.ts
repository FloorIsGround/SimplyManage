export interface Review {
    id: number;
    userId: string;
    bookId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    firstName?: string;
    lastName?: string;
}

export interface CreateReviewInput {
    userId: string;
    bookId: string;
    rating: number;
    comment?: string | null;
}

export interface UpdateReviewInput {
    rating?: number;
    comment?: string | null;
}