// react-ui/src/Components/Book/Reviews/useBookReviews.ts
import { useEffect, useState } from "react";
import axiosServices from "../../../utils/axios-api";
import type { Review } from "../../../Models/Book/Book";

export function useBookReviews(bookId: string | null) {
    const [reviews, setReviews] = useState<Review[]>([]);

    async function refreshReviews() {
        if (!bookId) return;
        const res = await axiosServices.get(`/reviews/book/${bookId}`);
        setReviews(res.data);
    }

    useEffect(() => {
        if (!bookId) return;

        async function fetchReviews() {
            const res = await axiosServices.get(`/reviews/book/${bookId}`);
            setReviews(res.data);
        }

        fetchReviews();
    }, [bookId]);

    return { reviews, refreshReviews };
}
