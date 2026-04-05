// react-ui/src/Components/Book/Reviews/useBookReviews.ts
import { useEffect, useState } from "react";
import axiosServices from "../../../utils/axios-api";
import type { Review } from "../../../Models/Book/Book";

export function useBookReviews(bookId: string | null) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState<number>(0);

    useEffect(() => {
        if (!bookId) return;

        async function fetchReviews() {
            const res = await axiosServices.get(`/reviews/book/${bookId}`);
            const fetchedReviews: Review[] = res.data;

            setReviews(fetchedReviews);

            if (fetchedReviews.length > 0) {
                const avg = fetchedReviews.reduce((sum, r) => sum + r.rating, 0) / fetchedReviews.length;
                setAverageRating(avg);
            } else {
                setAverageRating(0);
            }
        }

        fetchReviews();
    }, [bookId]);

    return { reviews, setReviews, averageRating };
}
