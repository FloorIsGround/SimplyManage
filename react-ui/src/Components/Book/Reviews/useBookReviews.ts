// react-ui/src/Components/Book/Reviews/useBookReviews.ts

import { useEffect, useRef, useState } from "react";
import axiosServices from "../../../utils/axios-api";
import type { Review } from "../../../Models/Book/Book";

/*
  useBookReviews Hook
  -------------------
  This custom hook is responsible for:
    • Fetching all reviews for a given book
    • Enriching each review with the reviewer's first/last name
    • Caching user lookups to avoid repeated API calls
    • Exposing both the reviews and a setter so the parent component
      can optimistically add new reviews (e.g., after submitting one)

  This keeps BookDetails.tsx clean and moves all review-related
  data logic into a single, reusable hook.
*/
export function useBookReviews(bookId: string | null) {

    // Holds the final enriched list of reviews
    const [reviews, setReviews] = useState<Review[]>([]);

    /*
      Cache for user lookups:
      - Key: userId
      - Value: { firstName, lastName }
      This prevents unnecessary API calls when multiple reviews
      belong to the same user.
    */
    const userCache = useRef<Map<string, { firstName: string; lastName: string }>>(new Map());

    useEffect(() => {
        // If no book is selected, do nothing
        if (!bookId) return;

        /*
          fetchReviews()
          --------------
          Fetches raw reviews from the backend, then enriches each one
          with the reviewer's name. Uses caching to avoid duplicate
          /users/:id requests.
        */
        async function fetchReviews() {
            // Fetch raw reviews for the book
            const res = await axiosServices.get(`/reviews/book/${bookId}`);
            const rawReviews: Review[] = res.data;

            // Enrich each review with user first/last name
            const enriched = await Promise.all(
                rawReviews.map(async (review) => {

                    // If we've already fetched this user's name, reuse it
                    if (userCache.current.has(review.userId)) {
                        return { ...review, ...userCache.current.get(review.userId)! };
                    }

                    try {
                        // Fetch user info from backend
                        const userRes = await axiosServices.get(`/users/${review.userId}`);
                        const { firstName, lastName } = userRes.data;

                        // Store in cache for future reviews
                        userCache.current.set(review.userId, { firstName, lastName });

                        // Return enriched review
                        return { ...review, firstName, lastName };
                    } catch {
                        // If user lookup fails, return the review as-is
                        return review;
                    }
                })
            );

            // Update state with enriched reviews
            setReviews(enriched);
        }

        // Trigger the fetch when bookId changes
        fetchReviews();

    }, [bookId]); // Re-run when a different book is selected

    /*
      Expose:
        • reviews: the enriched list
        • setReviews: allows parent components to add new reviews
          (e.g., after submitting a new one)
    */
    return { reviews, setReviews };
}