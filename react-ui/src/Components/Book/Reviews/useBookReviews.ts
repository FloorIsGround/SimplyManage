// react-ui/src/Components/Book/Reviews/useBookReviews.ts
import { useEffect, useRef, useState } from "react";
import axiosServices from "../../../utils/axios-api";
import type { Review } from "../../../Models/Book/Book";

export function useBookReviews(bookId: string | null) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const userCache = useRef<Map<string, { firstName: string; lastName: string }>>(new Map());

    useEffect(() => {
        if (!bookId) return;

        async function fetchReviews() {
            const res = await axiosServices.get(`/reviews/book/${bookId}`);
            const rawReviews: Review[] = res.data;

            const enriched = await Promise.all(
                rawReviews.map(async (review) => {
                    if (userCache.current.has(review.userId)) {
                        return { ...review, ...userCache.current.get(review.userId)! };
                    }

                    try {
                        const userRes = await axiosServices.get(`/users/${review.userId}`);
                        const { firstName, lastName } = userRes.data;
                        userCache.current.set(review.userId, { firstName, lastName });
                        return { ...review, firstName, lastName };
                    } catch {
                        return review;
                    }
                })
            );

            setReviews(enriched);
        }

        fetchReviews();
    }, [bookId]);

    return { reviews, setReviews };
}